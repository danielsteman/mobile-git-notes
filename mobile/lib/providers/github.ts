import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { getToken, setToken, clearToken } from "@/lib/auth";
import type { CommitFileParams, GitProvider, GitRepo, GitUser } from "./types";

const GITHUB_API = "https://api.github.com";
const GITHUB_DEVICE_CODE_URL = "https://github.com/login/device/code";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, init);
  if (!resp.ok) {
    const text = await resp.text();
    // Surface friendlier error if device flow is disabled
    if (/device\s*flow|device\s*verification/i.test(text)) {
      throw new Error(
        "GitHub Device Flow is disabled for this OAuth app. Enable it in GitHub → Settings → Developer settings → OAuth Apps → Your app → Device Flow: Enable."
      );
    }
    throw new Error(text || `Request failed with ${resp.status}`);
  }
  return (await resp.json()) as T;
}

async function withAuth<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    ...(init.headers as Record<string, string>),
  };
  return fetchJson<T>(`${GITHUB_API}${path}`, { ...init, headers });
}

export const githubProvider: GitProvider = {
  async signIn(): Promise<void> {
    const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      throw new Error("Missing EXPO_PUBLIC_GITHUB_CLIENT_ID");
    }

    type DeviceCodeResp = {
      device_code: string;
      user_code: string;
      verification_uri: string;
      expires_in: number;
      interval: number;
    };

    let dcResp: DeviceCodeResp;
    try {
      dcResp = await fetchJson<DeviceCodeResp>(GITHUB_DEVICE_CODE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          scope: "repo user",
        }),
      });
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (/device\s*flow|device\s*verification/i.test(msg)) {
        throw new Error(
          "Device Flow is disabled for this GitHub OAuth app. Enable it: GitHub → Settings → Developer settings → OAuth Apps → [Your App] → Device Flow → Enable."
        );
      }
      throw e;
    }

    Alert.alert(
      "Authorize with GitHub",
      `Enter this code: ${dcResp.user_code}`,
      [
        {
          text: "Open GitHub",
          onPress: () => {
            void WebBrowser.openBrowserAsync(dcResp.verification_uri);
          },
        },
        { text: "OK" },
      ]
    );

    // Poll for token
    const pollIntervalMs = (dcResp.interval ?? 5) * 1000;
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Stop if expired (buffer a few seconds)
      if (Date.now() - start > (dcResp.expires_in - 5) * 1000) {
        throw new Error("Authorization timed out");
      }
      const tokenResp = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          device_code: dcResp.device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      });
      const tokenJson = await tokenResp.json();
      if ("error" in tokenJson) {
        const err = String(tokenJson.error);
        if (err === "authorization_pending") {
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          continue;
        }
        if (err === "slow_down") {
          await new Promise((r) => setTimeout(r, pollIntervalMs + 2000));
          continue;
        }
        if (err === "access_denied") {
          throw new Error("Access denied by user");
        }
        if (err === "expired_token") {
          throw new Error("Device code expired");
        }
        if (err.includes("device") && err.includes("disabled")) {
          throw new Error(
            "Device Flow is disabled for this GitHub OAuth app. Enable it: GitHub → Settings → Developer settings → OAuth Apps → [Your App] → Device Flow → Enable."
          );
        }
        throw new Error(err);
      }
      if (tokenJson.access_token) {
        await setToken(String(tokenJson.access_token));
        return;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  },

  async getUser(): Promise<GitUser> {
    return withAuth<GitUser>("/user");
  },

  async listRepos(): Promise<GitRepo[]> {
    // Fetch all repositories by following GitHub pagination via Link headers
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");

    const allRepos: GitRepo[] = [];
    let nextUrl:
      | string
      | undefined = `${GITHUB_API}/user/repos?per_page=100&page=1`;

    while (nextUrl) {
      const resp: Response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Request failed with ${resp.status}`);
      }
      const pageItems = (await resp.json()) as GitRepo[];
      allRepos.push(...pageItems);

      const link: string | null =
        resp.headers.get("link") || resp.headers.get("Link");
      nextUrl = undefined;
      if (link) {
        // Parse Link header to find rel="next"
        const parts: string[] = link.split(",").map((p: string) => p.trim());
        for (const part of parts) {
          const segments: string[] = part
            .split(";")
            .map((x: string) => x.trim());
          const urlPart: string = segments[0] || "";
          const attrs: string[] = segments.slice(1);
          if (!urlPart?.startsWith("<") || !urlPart.endsWith(">")) continue;
          const url: string = urlPart.slice(1, -1);
          const hasNextRel = attrs.some(
            (a: string) =>
              a.startsWith('rel="') &&
              a.endsWith('"') &&
              a.slice(5, -1) === "next"
          );
          if (hasNextRel) {
            nextUrl = url;
            break;
          }
        }
      }
    }

    return allRepos;
  },

  async putFile(params: CommitFileParams): Promise<any> {
    const { owner, repo, path, contentBase64, message, branch, sha } = params;
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
      path
    )}`;
    const payload: Record<string, string> = {
      message,
      content: contentBase64,
    };
    if (branch) payload.branch = branch;
    if (sha) payload.sha = sha;

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Commit failed with ${resp.status}`);
    }
    return resp.json();
  },

  async getAccessToken(): Promise<string | null> {
    return getToken();
  },

  async clearAccessToken(): Promise<void> {
    await clearToken();
  },
};

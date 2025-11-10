export type GitRepo = {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  private: boolean;
  stargazers_count?: number;
  html_url: string;
};

export type GitUser = {
  id: number;
  login: string;
  avatar_url: string | null;
};

export type CommitFileParams = {
  owner: string;
  repo: string;
  path: string;
  contentBase64: string;
  message: string;
  branch?: string;
  sha?: string;
};

export interface GitProvider {
  signIn(): Promise<void>;
  getUser(): Promise<GitUser>;
  listRepos(): Promise<GitRepo[]>;
  putFile(params: CommitFileParams): Promise<any>;
  getAccessToken(): Promise<string | null>;
  clearAccessToken(): Promise<void>;
}

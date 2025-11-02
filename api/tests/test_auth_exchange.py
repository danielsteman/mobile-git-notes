import respx


def test_exchange_code_success(client):
    with respx.mock(assert_all_called=True) as mock:
        mock.post("https://github.com/login/oauth/access_token").respond(
            json={"access_token": "gh-super-token", "scope": "repo"}
        )
        mock.get("https://api.github.com/user").respond(
            json={"id": 42, "login": "octocat", "avatar_url": "https://avatar"}
        )

        resp = client.post(
            "/auth/github/exchange",
            json={"code": "dummy", "code_verifier": "verifier"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "token" in data
        assert data["user"]["login"] == "octocat"

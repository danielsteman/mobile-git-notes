import base64

import respx

from app.models import OAuthToken, User
from app.security import encrypt_value, issue_app_jwt


def _seed_user_with_token(db_session, github_id=999):
    user = User(github_id=github_id, login="tester", avatar_url=None)
    db_session.add(user)
    db_session.flush()
    token = OAuthToken(
        user_id=user.id,
        provider="github",
        access_token_encrypted=encrypt_value("gh-test-token"),
    )
    db_session.add(token)
    db_session.commit()
    return user


def test_create_repo(client, db_session):
    user = _seed_user_with_token(db_session, github_id=999)
    jwt_token = issue_app_jwt(user.id)

    with respx.mock(assert_all_called=True) as mock:
        route = mock.post("https://api.github.com/user/repos").respond(
            json={"name": "my-repo", "private": False}
        )

        resp = client.post(
            "/github/repos",
            headers={"Authorization": f"Bearer {jwt_token}"},
            json={"name": "my-repo"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["name"] == "my-repo"
        assert route.called


def test_put_file(client, db_session):
    user = _seed_user_with_token(db_session, github_id=1000)
    jwt_token = issue_app_jwt(user.id)
    content_b64 = base64.b64encode(b"hello world\n").decode("ascii")

    with respx.mock(assert_all_called=True) as mock:
        route = mock.put(
            "https://api.github.com/repos/me/my-repo/contents/README.md"
        ).respond(json={"content": {"path": "README.md"}})

        resp = client.put(
            "/github/repos/me/my-repo/contents/README.md",
            headers={"Authorization": f"Bearer {jwt_token}"},
            json={"message": "init", "contentBase64": content_b64},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["content"]["path"] == "README.md"
        assert route.called


def test_list_repos_pagination(client, db_session):
    user = _seed_user_with_token(db_session, github_id=1001)
    jwt_token = issue_app_jwt(user.id)

    # Simulate being on page 2 with both prev and next pages available
    link_header = (
        '<https://api.github.com/user/repos?page=1&per_page=2>; rel="first", '
        '<https://api.github.com/user/repos?page=1&per_page=2>; rel="prev", '
        '<https://api.github.com/user/repos?page=3&per_page=2>; rel="next", '
        '<https://api.github.com/user/repos?page=5&per_page=2>; rel="last"'
    )

    with respx.mock(assert_all_called=True) as mock:
        route = mock.get("https://api.github.com/user/repos").respond(
            json=[{"id": 1, "name": "repo-1"}, {"id": 2, "name": "repo-2"}],
            headers={"Link": link_header},
        )

        resp = client.get(
            "/github/repos?per_page=2&page=2",
            headers={"Authorization": f"Bearer {jwt_token}"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()

        assert isinstance(data["items"], list)
        assert [r["name"] for r in data["items"]] == ["repo-1", "repo-2"]
        assert data["page"] == 2
        assert data["per_page"] == 2
        assert data["has_prev"] is True
        assert data["has_next"] is True
        assert data["prev_page"] == 1
        assert data["next_page"] == 3
        assert data["first_page"] == 1
        assert data["last_page"] == 5
        assert route.called

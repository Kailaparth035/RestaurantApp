import { gql } from "@apollo/client";

export const SignInQuery = gql`
  mutation getAccessToken($username: String!, $password: String!) {
    login(loginInput: { username: $username, password: $password }) {
      accessToken
    }
  }
`;

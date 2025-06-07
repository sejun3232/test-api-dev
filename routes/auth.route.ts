import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios, { AxiosError, isAxiosError } from 'axios';

// Discord OAuth2 설정
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

// Discord API 엔드포인트
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_OAUTH_BASE = 'https://discord.com/oauth2';

// 타입 정의
interface DiscordTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string | null;
  global_name: string | null;
  avatar: string | null;
  email: string;
  verified: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export function registerAuthRoute(fastify: FastifyInstance) {
  // Discord OAuth2 로그인 시작
  fastify.get('/auth/discord', async (request: FastifyRequest, reply: FastifyReply) => {
    const scope = 'identify email guilds';
    const authUrl = `${DISCORD_OAUTH_BASE}/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    reply.redirect(authUrl);
  });

  // Discord OAuth2 콜백 처리
  fastify.get('/auth/discord/callback', async (request: FastifyRequest<{
    Querystring: { code?: string; error?: string }
  }>, reply: FastifyReply) => {
    try {
      const { code, error } = request.query;

      if (error) {
        return reply.status(400).send({ error: 'OAuth2 인증 실패', details: error });
      }

      if (!code) {
        return reply.status(400).send({ error: '인증 코드가 없습니다.' });
      }

      // 1. Access Token 요청
      const tokenResponse = await axios.post<DiscordTokenResponse>(`${DISCORD_API_BASE}/oauth2/token`,
        new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, token_type } = tokenResponse.data;

      // 2. 사용자 정보 가져오기
      const userResponse = await axios.get<DiscordUser>(`${DISCORD_API_BASE}/users/@me`, {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });

      const user = userResponse.data;

      // 3. 길드 정보 가져오기
      const guildsResponse = await axios.get<DiscordGuild[]>(`${DISCORD_API_BASE}/users/@me/guilds`, {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });

      const guilds = guildsResponse.data;

      // 4. JWT 토큰 생성
      const jwt = fastify.jwt.sign({
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        discriminator: user.discriminator,
        email: user.email,
        access_token,
        token_type
      }, { expiresIn: '24h' });

      // **JWT 토큰을 쿠키에 저장**
      reply.setCookie('jwt', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1일
      });

      // 5. 응답 반환
      return reply.send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          global_name: user.global_name,
          avatar: user.avatar,
          email: user.email,
          verified: user.verified,
        },
        guilds: guilds.map((guild) => ({
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
        })),
        tokens: {
          access_token,
          refresh_token,
          token_type,
          jwt,
        }
      });

    } catch (error: unknown) {
      fastify.log.error('Discord OAuth2 콜백 에러:', error);

      let errorMessage = 'Discord 인증 처리 중 오류가 발생했습니다.';
      let errorDetails = 'Unknown error';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.error_description || errorMessage;
        errorDetails = error.message;
      } else if (error instanceof Error) {
        errorDetails = error.message;
      }

      return reply.status(500).send({
        error: errorMessage,
        details: errorDetails
      });
    }
  });

  // 토큰 갱신
  fastify.post('/auth/discord/refresh', async (request: FastifyRequest<{
    Body: { refresh_token: string }
  }>, reply: FastifyReply) => {
    try {
      const { refresh_token } = request.body;

      if (!refresh_token) {
        return reply.status(400).send({ error: 'Refresh token이 필요합니다.' });
      }

      const tokenResponse = await axios.post<DiscordTokenResponse>(`${DISCORD_API_BASE}/oauth2/token`,
        new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return reply.send(tokenResponse.data);

    } catch (error: unknown) {
      fastify.log.error('토큰 갱신 에러:', error);

      let errorMessage = '토큰 갱신 중 오류가 발생했습니다.';
      if (isAxiosError(error) && error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
      }

      return reply.status(500).send({ error: errorMessage });
    }
  });

  // 로그아웃
  fastify.post('/auth/discord/logout', async (request: FastifyRequest<{
    Body: { access_token: string }
  }>, reply: FastifyReply) => {
    try {
      const { access_token } = request.body;

      if (!access_token) {
        return reply.status(400).send({ error: 'Access token이 필요합니다.' });
      }

      await axios.post(`${DISCORD_API_BASE}/oauth2/token/revoke`,
        new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          token: access_token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return reply.send({ success: true, message: '로그아웃되었습니다.' });

    } catch (error: unknown) {
      fastify.log.error('로그아웃 에러:', error);

      let errorMessage = '로그아웃 중 오류가 발생했습니다.';
      if (isAxiosError(error) && error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
      }

      return reply.status(500).send({ error: errorMessage });
    }
  });
}

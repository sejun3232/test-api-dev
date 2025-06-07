import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import pLimit from 'p-limit';
import { redisClient } from '../src/redisclient'; // 경로는 프로젝트 구조에 맞게 수정

const ADMIN_PERMISSION = 0x00000008;

// JWT 인증 미들웨어 (fastify-jwt 플러그인 필요)
async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  if (!request.headers.authorization && request.cookies?.jwt) {
    request.headers.authorization = `Bearer ${request.cookies.jwt}`;
  }
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: '인증이 필요합니다.' });
  }
}

export function registerUserRoute(fastify: FastifyInstance) {
  fastify.get('/api/user', { preValidation: [verifyJWT] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { access_token, token_type } = user;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN이 .env에서 불러와지지 않았습니다!');
      return reply.status(500).send({ message: "서버에 봇 토큰이 설정되어 있지 않습니다." });
    }

    try {
      // 1. 유저 정보
      const userInfoRes = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `${token_type} ${access_token}` }
      });
      const userInfo = userInfoRes.data;

      // 2. 유저가 속한 길드 목록
      const userGuildsRes = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `${token_type} ${access_token}` }
      });
      const userGuilds = userGuildsRes.data;

      // 3. 봇이 속한 길드 목록
      const botGuildsRes = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
      });
      const botGuildIds = botGuildsRes.data.map((g: any) => g.id);

      // 4. 각 길드에 대해 봇 참여여부, owner, 멤버수, 온라인수 등 추가
      const limit = pLimit(2);
      const userGuildsWithBotStatus = await Promise.all(
        userGuilds.map((guild: any) =>
          limit(async () => {
            const botInGuild = botGuildIds.includes(guild.id);
            let memberCount = null;
            let onlineCount = null;

            if (botInGuild) {
              const cacheKey = `discord:guild:${guild.id}:info`;
              const cached = await redisClient.get(cacheKey);

              if (cached) {
                const data = JSON.parse(cached);
                memberCount = data.memberCount;
                onlineCount = data.onlineCount;
              } else {
                const guildDetailsRes = await axios.get(
                  `https://discord.com/api/v10/guilds/${guild.id}?with_counts=true`,
                  { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
                );
                if (guildDetailsRes.status === 200) {
                  const details = guildDetailsRes.data;
                  memberCount = details.approximate_member_count;
                  onlineCount = details.approximate_presence_count;
                  await redisClient.set(cacheKey, JSON.stringify({ memberCount, onlineCount }), { EX: 86400 });
                }
              }
            }

            return {
              id: guild.id,
              name: guild.name,
              icon: guild.icon,
              botinguild: botInGuild,
              owner: guild.owner || ((guild.permissions & ADMIN_PERMISSION) === ADMIN_PERMISSION),
              memberCount,
              onlineCount,
            };
          })
        )
      );

      const responseData = {
        loggedIn: true,
        user: {
          id: userInfo.id,
          username: userInfo.username,
          global_name: userInfo.global_name,
          discriminator: userInfo.discriminator,
          avatar: userInfo.avatar,
          email: userInfo.email,
          premium_type: userInfo.premium_type,
          flags: userInfo.flags,
        },
        guilds: userGuildsWithBotStatus,
      };

      // 웹소켓으로도 데이터 전송 (클라이언트가 'userInfo' 이벤트를 수신해야 함)
      if ((fastify as any).io) {
        (fastify as any).io.emit('userInfo', responseData);
      }

      return reply.send(responseData);
    } catch (error: any) {
      console.error("API 요청 중 오류 발생:", error?.response?.data || error);
      return reply.status(500).send({ message: "서버 오류 발생", details: error?.response?.data || error?.message });
    }
  });
}
npm run dev 입력하시면 미리보기 나오고  
npm run build 하신 다음에 npm start 하셔야 서비스 시작입니다.  
.env 에 정보들 넣으셔야 에러 없이 정상 작동합니다.  
켜지면 /auth/discord 로 들어가셔서 로그인 하신 다음  
/api/user 로 가셔야 정보가 뜹니다.  
npm i 도 꼭 해주세요.  
jwt_token 은 충분히 복잡하게 해야 해킹 안당해요.  
jwt 모르겠으면 콘솔에다가 node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  이거치시고 나오는 이상한 문자들 그대로 복붙하시면 되요.
REDIS_URL은 https://redis.io/ 여기 들어가면 redis cloud 만들수있어요 그거 만들어서 링크 붙여서 쓰세여.

![세팅](https://github.com/sejun3232/img/blob/main/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202025-06-07%20153403.png)  

리다이렉트는 http://localhost:3001/auth/discord/callback 로 하시고 디스코드 개발자포털에 들어가셔서 토큰,클라이언트 아이디, 클라이언트 시크릿, 리다이렉트 링크를 넣어주시면 됩니다


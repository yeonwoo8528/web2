# React / Express / Mysql 을 활용한 SNS Web application

## 프로젝트 제작 인원
- 김연우 : 라우팅 구현, 댓글 달기 구현
- 장현민 : 마이페이지, 게시글 작성 구현
로그인, 회원가임, CSS파일 작성은 같이 진행하였음.

### 개발 환경

- React
- Express.js
- DB : Mysql

## 서버 : server.js

### 주요 의존성 : 
- [Express](https://expressjs.com/): Node.js를 위한 웹 프레임워크
- [express-session](https://www.npmjs.com/package/express-session): 사용자 세션 관리 미들웨어
- [express-mysql-session](https://www.npmjs.com/package/express-mysql-session): MySQL을 위한 Express 세션 저장소
- [cors](https://www.npmjs.com/package/cors): Cross-Origin Resource Sharing을 활성화하기 위한 미들웨어
- [body-parser](https://www.npmjs.com/package/body-parser): 들어오는 요청 본문을 구문 분석하는 미들웨어

### 주요 엔드포인트 :

- `/login`: 사용자 로그인 처리
- `/signin`: 사용자 회원가입 처리
- `/userdata`: 로그인한 사용자의 데이터 및 작성한 게시글 조회
- `/boards`: 모든 게시글 및 작성자 조회
- `/posts`: 게시글 작성 및 삭제 모든 게시글 조회
- `/comments/:postId`: 특정 게시글에 대한 댓글 조회 및 작성

## 클라이언트 : App.js

### 주요 컴포넌트:

- `Main`: 홈페이지 및 로그인, 회원가입 링크 제공
- `Login`: 사용자 로그인 폼 
- `Signin`: 사용자 회원가입 폼
- `Welcome`: 로그인 후 메인 페이지, 게시글 조회 및 로그아웃 기능 제공
- `Board`: 모든 게시글 조회 페이지
- `Post`: 게시글 작성 폼
- `Comment`: 특정 게시글에 대한 댓글 조회 및 작성 기능 제공

## DB : Mysql

### Table 구성

- firstmysql : id, password, name
- posts : idx, id, content
- comments : idx, postId, writer, comment

## 빌드 방법

- `npm run build`

## 실행 방법

1. 서버 실행: `node server.js`
2. 클라이언트 실행: `npm start`



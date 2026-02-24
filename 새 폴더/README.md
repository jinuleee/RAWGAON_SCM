# 로가온 SCM (미니 사방넷 v2.0)

이 프로젝트는 판매 채널 관리(SCM)를 위한 대시보드 시스템입니다. 다른 컴퓨터에서도 이어서 작업하실 수 있도록 아래 가이드를 참고해 주세요.

## 💻 다른 컴퓨터에서 작업하는 방법

### 1. 코드 동기화 (OneDrive 이용)
현재 프로젝트 폴더가 **OneDrive** 내에 위치하고 있습니다 (`OneDrive - RAWGAON`).
*   다른 컴퓨터에서도 동일한 OneDrive 계정으로 로그인하시면 파일이 자동으로 동기화됩니다.
*   파일 탐색기에서 동기화가 완료된 것을 확인한 후 작업 폴더를 여세요.

### 2. 코드 동기화 (GitHub 이용)
저장소 주소: [https://github.com/jinuleee/mini-sabangnet](https://github.com/jinuleee/mini-sabangnet)
*   **GitHub Desktop** 또는 Git 툴을 설치하세요.
*   작업이 끝나면 반드시 **Commit & Push**를 하여 변경 사항을 서버에 올리세요.
*   다른 컴퓨터에서 작업을 시작하기 전에 반드시 **Pull**을 받아 최신 상태를 유지하세요.

### 3. Antigravity와 함께 작업하기
*   Antigravity(AI 에이전트)는 **Conversation ID**를 기반으로 이전 작업 내용을 기억합니다.
*   같은 계정으로 로그인한 후, 이 대화(Conversation)를 열면 제가 이전에 설명했던 내용과 현재 진행 중인 작업을 그대로 이어서 도와드릴 수 있습니다.

---

## 🛠️ 개발 환경 설정
*   **Frontend**: `index.html`, `app.js`, `styles.css`
*   **Backend**: Google Apps Script (GAS)
*   **Authentication**: Microsoft Azure AD (MSAL)

로컬에서 실행할 때는 VS Code의 `Live Server` 확장을 사용하거나, 브라우저에서 `index.html`을 열어 확인하실 수 있습니다. (단, MSAL 인증은 등록된 Redirect URI 범위 내에서만 작동합니다.)

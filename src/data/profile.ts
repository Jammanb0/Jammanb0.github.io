/**
 * 사이트 소유자 정보. 전부 string입니다 — 원하는 값으로 바꾸세요.
 * - name / nameKo: 영문·한글 이름. 사원증과 안내 문장에 쓰입니다.
 * - tagline: 첫 화면 제목. `\n`을 넣으면 그 자리에서 줄바꿈됩니다.
 * - intro: 첫 화면 제목 아래 한 줄 소개.
 * - bio: '이렇게 일합니다' 이야기의 본문.
 * - email: 연락처 페이지 맨 앞에 보이는 이메일(누르면 메일 앱이 열립니다).
 * - avatar: 헤더 이름 옆 원형 프로필 사진. public/ 기준 경로. 빈 문자열이면 표시하지 않습니다.
 * - badgePhoto: 사원증에 들어가는 증명사진. public/ 기준 경로.
 * - site: 사원증 아래에 적히는 주소.
 * - heroCta: 첫 화면의 두 번째 버튼. 'mailto:...'면 메일 앱이, 'https://...'면 새 탭이 열립니다.
 * - social: 연락처 페이지와 푸터에 순서대로 표시됩니다. description은 연락처 페이지에만 보입니다.
 */
export const profile = {
  name: 'Guhn Park',
  nameKo: '박건',
  role: 'Web Developer & AI Builder',
  tagline: '생각은 자유롭게,\n코드는 견고하게.',
  intro: '사용자의 경험을 세심하게 다듬고, 오래 유지되는 코드를 만듭니다.',
  bio: '작은 디테일과 예외 상황까지 놓치지 않는 꼼꼼함이 서비스의 완성도를 만든다고 믿습니다. 기획을 그대로 옮기는 데 그치지 않고, 논리적이고 견고한 코드로 아이디어를 사용자에게 가치 있는 결과물로 구현합니다. 화면과 서버를 가리지 않고 필요한 것을 직접 만들며, 그 과정에서 AI를 적극적으로 활용합니다.',
  email: 'parkguhn@daum.net',
  avatar: '/profile_avatar.jpg',
  badgePhoto: '/badge_photo.jpg',
  site: 'jammanb0.github.io',
  heroCta: {
    label: 'GitHub',
    href: 'https://github.com/Jammanb0',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/Jammanb0', description: '코드와 프로젝트 저장소' },
    { label: 'Tistory', url: 'https://pistol-logic.tistory.com/', description: '블로그' },
  ],
}

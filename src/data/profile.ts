/**
 * 사이트 소유자 정보. 전부 string입니다 — 원하는 값으로 바꾸세요.
 * - tagline: 히어로 섹션 제목. `\n`을 넣으면 그 자리에서 줄바꿈됩니다.
 * - avatar: Header 로고 옆에 표시되는 원형 프로필 사진. public/ 폴더에 이미지를
 *   넣고 '/파일명.jpg' 형태로 지정하세요. 정사각형이 아니어도 됩니다 — 자동으로
 *   원형으로 크롭(object-fit: cover)됩니다. 빈 문자열이면 아무것도 표시되지 않습니다.
 * - heroCta: 홈 화면 히어로의 두 번째 버튼(기본은 "이메일 보내기"). label과
 *   href를 자유롭게 바꿀 수 있습니다 — 이메일이 아니라 이력서 PDF, 연락처
 *   폼, Calendly 링크 등으로 바꿔도 됩니다. href가 'mailto:...'면 방문자의
 *   기본 메일 앱이 열리고, 'https://...'면 그냥 새 탭으로 이동합니다.
 * - social: 원하는 만큼 추가/삭제 가능한 배열. Footer에 순서대로 표시됩니다.
 */
export const profile = {
  name: 'Guhn Park',
  role: 'Frontend Developer',
  tagline: '생각은 자유롭게,\n코드는 견고하게.',
  bio: '작은 디테일과 예외 상황까지 놓치지 않는 꼼꼼함이 서비스의 완성도를 만든다고 믿습니다. 기획을 그대로 옮기는 데 그치지 않고, 논리적이고 견고한 코드로 아이디어를 사용자에게 가치 있는 결과물로 구현하는 프론트엔드 개발자입니다.',
  email: 'parkguhn@hanmail.net',
  avatar: '/profile_avatar.jpg',
  heroCta: {
    label: 'GitHub',
    href: 'https://github.com/Jammanb0',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/Jammanb0' },
    { label: 'Tistory', url: 'https://pistol-logic.tistory.com/' },
  ],
}

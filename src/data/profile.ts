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
  name: '홍길동',
  role: 'Frontend Developer',
  tagline: '사용자 경험을 고민하는\n프론트엔드 개발자입니다.',
  bio: '빠르고 아름다운 인터페이스를 만드는 것을 좋아합니다. React와 TypeScript를 주로 사용하며, 세심한 인터랙션과 애니메이션으로 제품의 완성도를 높이는 데 관심이 많습니다.',
  email: 'hello@example.com',
  avatar: '',
  heroCta: {
    label: '이메일 보내기',
    href: 'mailto:hello@example.com',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/your-id' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/your-id' },
    { label: 'Email', url: 'mailto:hello@example.com' },
  ],
}

# 박건 — GitHub Pages

프론트엔드 개발자 박건의 개인 포트폴리오 사이트입니다.
[swiftfolio-template](https://github.com/Jammanb0/swiftfolio-template) (v1.1.0 기반)으로 만들었습니다.

🔗 [jammanb0.github.io](https://jammanb0.github.io)

## 개발

```bash
npm install
npm run dev
```

## 콘텐츠 수정

- [`src/data/profile.ts`](src/data/profile.ts) — 이름, 소개, 아바타, 소셜 링크
- [`src/data/projects.ts`](src/data/projects.ts) — 프로젝트 목록 (배열에 새 항목을 추가하면 자동 반영)

필드별 자세한 설명과 마크다운/유튜브 임베드 사용법은 [템플릿 레포 README](https://github.com/Jammanb0/swiftfolio-template#readme)를 참고하세요.

## 배포

```bash
npm run deploy
```

`gh-pages` 패키지가 빌드 결과를 `gh-pages` 브랜치로 push합니다. 레포 Settings → Pages에서 Source를 `gh-pages` 브랜치로 지정하면 반영됩니다 (최초 1회만).

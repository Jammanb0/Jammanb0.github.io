# 박건 — GitHub Pages

프론트엔드 개발자 박건의 개인 포트폴리오 사이트입니다.
[swiftfolio-template](https://github.com/Jammanb0/swiftfolio-template)을 기반으로 만들었고, 공통 기능 개선을 주기적으로 동기화합니다.

🔗 [jammanb0.github.io](https://jammanb0.github.io)

## 개발

### 요구 사항

- Node.js `^20.19.0` 또는 `>=22.12.0` (Node 22 LTS 권장)
- npm `10` 이상 권장

```bash
npm install
npm run dev
```

## 콘텐츠 수정

- [`src/data/profile.ts`](src/data/profile.ts) — 이름, 소개, 아바타, 소셜 링크
- [`src/data/projects.ts`](src/data/projects.ts) — 프로젝트 목록 (배열에 새 항목을 추가하면 자동 반영)

필드별 자세한 설명과 마크다운/유튜브 임베드 사용법은 [템플릿 레포 README](https://github.com/Jammanb0/swiftfolio-template#readme)를 참고하세요.

## 자동 배포

`.github/workflows/deploy-pages.yml`이 `main`에 push될 때 린트, 설정된 테스트, 프로덕션 빌드를 확인한 뒤 GitHub Pages에 자동 배포합니다.

최초 한 번 GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택해야 합니다. 이후에는 다음처럼 소스를 push하는 것만으로 사이트까지 반영됩니다.

```bash
git add .
git commit -m "..."
git push origin main
```

배포 진행 상황은 저장소의 **Actions → Deploy to GitHub Pages**에서 확인할 수 있습니다. 기존 `npm run deploy` 명령은 이전 `gh-pages` 수동 배포 방식으로 되돌려야 할 때를 위한 호환 경로로만 유지합니다.

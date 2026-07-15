import { Button } from '@/components/ui/Button'
import { wrapper, code, message } from './NotFound.css'

export default function NotFound() {
  return (
    <div className={wrapper}>
      <p className={code}>404</p>
      <p className={message}>페이지를 찾을 수 없습니다.</p>
      <Button to="/" tone="primary">
        홈으로 가기
      </Button>
    </div>
  )
}

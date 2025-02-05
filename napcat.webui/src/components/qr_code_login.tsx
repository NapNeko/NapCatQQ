import { Spinner } from '@heroui/spinner'
import { QRCodeSVG } from 'qrcode.react'

interface QrCodeLoginProps {
  qrcode: string
}

const QrCodeLogin: React.FC<QrCodeLoginProps> = ({ qrcode }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-2 rounded-md w-fit mx-auto relative overflow-hidden">
        {!qrcode && (
          <div className="absolute left-2 top-2 right-2 bottom-2 bg-white bg-opacity-50 backdrop-blur flex items-center justify-center">
            <Spinner color="primary" />
          </div>
        )}
        <QRCodeSVG size={180} value={qrcode} />
      </div>
      <div className="mt-5 text-center">请使用QQ或者TIM扫描上方二维码</div>
    </div>
  )
}

export default QrCodeLogin

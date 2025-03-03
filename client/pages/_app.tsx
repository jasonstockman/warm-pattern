import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../src/contexts/SocketContext'
import { UsersProvider } from '../src/contexts/UsersContext'
import Layout from '../src/components/Layout'
import SocketDebug from '../src/components/SocketDebug'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <UsersProvider>
        <SocketProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          {process.env.NODE_ENV === 'development' && <SocketDebug />}
        </SocketProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default MyApp 
import Toast from "@/components/base/Toast/Toast"
import styles from "./Layout.module.scss"
import Navbar from "../Navbar/Navbar"
import Header from "../Header/Header"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={styles.wrapper}>
      <Navbar />
      <div className={styles.content}>
        <Header />
        {children}
      </div>
      <Toast />

    </main>
  )
}

export default Layout
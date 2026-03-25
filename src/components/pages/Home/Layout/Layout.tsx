import Toast from "@/components/base/Toast/Toast"
import styles from "./Layout.module.scss"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={styles.wrapper}>
      {children}
      <Toast />

    </main>
  )
}

export default Layout
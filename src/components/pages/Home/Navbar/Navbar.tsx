import styles from "./Navbar.module.scss"

const Navbar = () => {
  return (
    <aside className={styles.navbar}>
      <p className={styles.logo}>EXPENSY</p>
      <nav className={styles.nav}>
        <ul className={styles.nav_list}>
          <li className={styles.nav_item}>
            Expense Reports
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Navbar

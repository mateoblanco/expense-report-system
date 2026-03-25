import { useUser } from "@/providers/UserProvider"
import styles from "./Navbar.module.scss"
import { signOut } from "firebase/auth"
import { auth } from "@/auth/firebase"

const Navbar = () => {
    const { user } = useUser()

    
  return (
    <nav className={styles.navbar}>
      <h1>Navbar</h1>
      <p>
                Logged in as {user!.email}
                {" "}
                <button type="button" onClick={() => signOut(auth)}>
                    Logout
                </button>
            </p>
    </nav>
  )
}

export default Navbar
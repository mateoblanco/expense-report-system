import { useUser } from "@/providers/UserProvider"
import styles from "./Header.module.scss"
import { signOut } from "firebase/auth"
import { auth } from "@/auth/firebase"
import { useRef, useState } from "react"
import useClickOutside from "@/hooks/useClickOutside"
import Button from "@/components/base/Button/Button"

const Header = () => {
    const { user } = useUser()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useClickOutside(menuRef, () => {
        setIsMenuOpen(false)
    }, { enabled: isMenuOpen })

    return (
        <header className={styles.header}>
            <p className={styles.page_name}>Expense Reports</p>
            {user && (
                <div ref={menuRef} className={styles.user_menu_wrapper}>
                    <button
                        type="button"
                        className={styles.user_button}
                        onClick={() => setIsMenuOpen((prevState) => !prevState)}
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                    >
                        {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                    </button>

                    {isMenuOpen && (
                        <div className={styles.user_menu}>
                            <div className={styles.user_info}>
                                <p className={styles.user_menu_user_name}>{user.displayName ?? "User"}</p>
                                <p className={styles.user_menu_user_email}>{user.email}</p>
                            </div>
                            <Button label="Logout" variant="secondary" onClick={() => signOut(auth)} />
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}

export default Header

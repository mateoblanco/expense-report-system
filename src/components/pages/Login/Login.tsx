import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { auth } from "@/auth/firebase"
import { useUser } from "@/providers/UserProvider"
import styles from "./Login.module.scss"
import Button from "@/components/base/Button/Button"
import GoogleIcon from "@/assets/icons/google.svg"
import { useAddErrorToast } from "../Home/hooks/useAddErrorToast"

const googleProvider = new GoogleAuthProvider()

const Login = () => {
  const { loading } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addErrorToast = useAddErrorToast()

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      addErrorToast(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.title_wrapper}>
          <h1 className={styles.title}>Welcome to Expensy</h1>
          <p className={styles.description}>Create expense reports easily</p>
        </div>
        <Button
          label="Continue with Google"
          variant="primary"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || loading}
          isLoading={isSubmitting || loading}
          icon={<GoogleIcon width={16} height={16} />}
        />
      </div>
    </main>
  )
}

export default Login

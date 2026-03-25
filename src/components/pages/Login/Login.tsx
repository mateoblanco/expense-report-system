import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { auth } from "@/auth/firebase"
import { useUser } from "@/providers/UserProvider"

const googleProvider = new GoogleAuthProvider()


const Login = () => {
    const { user, loading } = useUser()
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    const handleGoogleSignIn = async () => {
      setError(null)
      setIsSubmitting(true)
  
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed")
      } finally {
        setIsSubmitting(false)
      }
    }
  
    return (
      <main>
        <h1>Expense Reports</h1>
        <button type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in with Google"}
        </button>
        {error ? <p>{error}</p> : null}
        {loading ? <p>Loading...</p> : null}
      </main>
    )
}

export default Login
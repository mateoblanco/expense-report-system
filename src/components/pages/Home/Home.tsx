"use client"

import { useUser } from "@/providers/UserProvider"
import Login from "../Login/Login"
import ExpenseReports from "./ExpenseReports/ExpenseReports"
import Layout from "./Layout/Layout"
import Navbar from "./Navbar/Navbar"


const Home = () => {
    const { user,  } = useUser()

    if (!user) {
        return <Login />
    }

    return (
        <Layout>
            <Navbar />
            <ExpenseReports />
        </Layout>
    )
}

export default Home
import { useState, useEffect } from "react"
import axios from "axios"
import Button from "@mui/material/Button"

export const Name = () => {
    const [profileData, setProfileData] = useState(null)

    function getData() {
        axios({
            method: "GET",
            url: "http://127.0.0.1:5000/",
        })
            .then((response) => {
                console.log(response)
                const res = response.data
                setProfileData({
                    profile_name: res.name,
                })
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            })
    }
    return (
        <div className="App">
            <header className="App-header">
                <Button onClick={getData} variant="contained">
                    Hello world
                </Button>
                {profileData && (
                    <div>
                        <p>Profile name: {profileData.profile_name}</p>
                    </div>
                )}
            </header>
        </div>
    )
}

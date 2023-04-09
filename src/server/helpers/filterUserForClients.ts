import { User } from "@clerk/nextjs/dist/api"

export const filterUserForClient = (user:User) => {

    return{
        id: user.id, name: user.username, profilePicture: user.profileImageUrl
    }

}
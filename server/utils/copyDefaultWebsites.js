import User from "../models/user.model.js"
import Website from "../models/website.model.js"

export const copyDefaultWebsites = async (newUser) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL
        if (!adminEmail) return

        const admin = await User.findOne({ email: adminEmail })
        if (!admin || admin._id.equals(newUser._id)) return

        const sites = await Website.find({ user: admin._id })
        if (sites.length === 0) return

        const copies = sites.map((w) => {
            const obj = w.toObject()
            delete obj._id
            delete obj.__v
            delete obj.createdAt
            delete obj.updatedAt
            delete obj.slug
            delete obj.deployUrl
            obj.user = newUser._id
            obj.deployed = false
            return obj
        })

        await Website.insertMany(copies)
    } catch (error) {
        console.log("copyDefaultWebsites error:", error.message)
    }
}
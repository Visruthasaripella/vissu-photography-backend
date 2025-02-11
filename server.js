import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config(); // Load .env variables

const app = express();
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Allow JSON requests

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Fetch all folders from Cloudinary
app.get("/api/cloudinary/folders", async (req, res) => {
    try {
        const response = await cloudinary.api.root_folders();
        res.json({ folders: response.folders });
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Error fetching folders" });
    }
});

// ✅ Fetch images from a specific folder
app.get("/api/cloudinary/folders/:folder/images", async (req, res) => {
    try {
        const { folder } = req.params;
        const response = await cloudinary.search
            .expression(`folder:${folder} AND resource_type:image`)
            .max_results(100)
            .execute();
        
        res.json({ images: response.resources });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Error fetching images" });
    }
});

// ✅ Create a new folder (Uploads a dummy image to create the folder)
app.post("/api/cloudinary/folders", async (req, res) => {
    try {
        const { folderName } = req.body;

        if (!folderName) {
            return res.status(400).json({ error: "Folder name is required" });
        }

        await cloudinary.uploader.upload(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/ayYAdQAAAAASUVORK5CYII=",
            { folder: folderName, public_id: "folder_placeholder" }
        );

        res.json({ message: "Folder created successfully" });
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ error: "Error creating folder" });
    }
});


app.get("/api/testing", async (req, res) => {
    return "works";
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

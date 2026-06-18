const express = require("express");
const cors = require("cors");
const db = require("./db");

const util = require("util");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");

const execPromise = util.promisify(exec);


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());



// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "@gmail.com",
        pass: ""
    }
});



// Health check
app.get("/", (req, res) => {
    res.send("Node.js API is running");
});

// Registration API
app.post("/register", (req, res) => {

    const { fullname, username, password, email } = req.body;

    // Validation
    if (!fullname || !username || !password || !email) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql =
        "INSERT INTO requests(full_name, user_name, password, email) VALUES (?, ?, ?, ?)";

   
    db.query(
        sql,
        [fullname, username, password, email],
        (err, result) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            console.log("User saved successfully");

            res.status(200).json({
                message: "Registration submitted successfully"
            });
        }
    );

});


// Fetch all requests
app.get("/requests", (req, res) => {

    db.query(
        "SELECT * FROM requests ORDER BY id DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(results);

        }
    );

});



// Approve requests + trigger provisioning
app.put("/approve/:id", async (req, res) => {

    const id = req.params.id;

    try {

        // Get user details
        db.query(
            "SELECT full_name, user_name, password, email FROM requests WHERE id=?",
            [id],
            async (err, result) => {

                if (err || result.length === 0) {
                    return res.status(500).json({
                        message: "User not found or DB error"
                    });
                }

                const user = result[0];
		const fullname = user.full_name
                const username = user.user_name;
                const password = user.password;
                const email = user.email;

                // Update status to Approved
                db.query(
                    "UPDATE requests SET status='Approved' WHERE id=?",
                    [id],
                    async (err2) => {

                        if (err2) {
                            return res.status(500).json({
                                message: "Status update failed"
                            });
                        }

                        try {

                            // Run onboarding script and wait for completion
                            const cmd = `python3 /home/ubuntu/scripts/user_onboarding.py "${username}" "${password}"`;

                            const { stdout, stderr } = await execPromise(cmd);

                            console.log("Script output:", stdout);

                            if (stderr) {
                                console.error("Script stderr:", stderr);
                            }

                            // Send onboarding email
                            await transporter.sendMail({
                                from: "@gmail.com",
                                to: email,
				subject: "Welcome to TuringIQ Training Platform 🚀",

    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p> Dear <b>${fullname}</b>, </p>

            <h2>Welcome to TuringIQ Training Platform! 🚀</h2>

            <p>
                We are excited to have you onboard.
            </p>

            <p>
                Your training environment has been successfully provisioned and is ready for use.
            </p>

            <p>
                Please find the onboarding document attached to this email. It contains detailed instructions for accessing the resources required for your training.
            </p>

            <p>
                If you have any questions or need assistance, please feel free to reach out to the training team.
            </p>

            <br>

            <p>
                We wish you a productive and enjoyable learning experience.
            </p>

            <br>

            <p>
                Best regards,<br>
                <b>TuringIQ Team</b>
            </p>

        </div>
    `,
                                attachments: [
                                    {
                                        filename: "Turingiq-Training-Onboarding-Doc.pdf",
                                        path: "/home/ubuntu/Turingiq-Training-Onboarding-Doc.pdf"
                                    }
                                ]
                            });

                            console.log("Email sent successfully");

                            res.json({
                                message: "Provisioning completed and onboarding email sent"
                            });

                        } catch (error) {

                            console.error("Provisioning error:", error);

                            res.status(500).json({
                                message: "Provisioning or email failed"
                            });
                        }

                    }
                );

            }
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal server error"
        });
    }

});




// Reject requests
app.put("/reject/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "UPDATE requests SET status='Rejected' WHERE id=?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({
                message: "Request rejected"
            });

        }
    );

});



app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const sql =
        "SELECT * FROM admin_users WHERE username=? AND password=?";

    db.query(
        sql,
        [username, password],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (result.length > 0) {

                return res.status(200).json({
                    message: "Login successful"
                });

            }

            res.status(401).json({
                message: "Invalid username or password"
            });

        }
    );

});




// Delete User
app.put("/delete/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT full_name, user_name, password, email FROM requests WHERE id=?",
        [id],
        (err, result) => {

            if (err || result.length === 0) {

                return res.status(500).json({
                    message: "User not found"
                });

            }

            const user = result[0];

            const username = user.user_name;
            const password = user.password;
            const email = user.email;


            const cmd =
                `python3 /home/ubuntu/scripts/user_deprovisioning.py "${username}"`;
	   


            exec(cmd, (error, stdout, stderr) => {
		console.log("Script output:", stdout);


                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message: "Script failed"
                    });

                }

                db.query(
                    "UPDATE requests SET status='Deleted' WHERE id=?",
                    [id]
                );

                res.json({
                    message: "Infrastructure deleted successfully"
                });

            });

        }

    );

});





app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

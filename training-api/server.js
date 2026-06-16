const express = require("express");
const cors = require("cors");
const db = require("./db");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.send("Node.js API is running");
});

// Registration API
app.post("/register", (req, res) => {

    const { firstname, lastname, password, email } = req.body;

    // Validation
    if (!firstname || !lastname || !password || !email) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql =
        "INSERT INTO requests(first_name, last_name, password, email) VALUES (?, ?, ?, ?)";

   
    db.query(
        sql,
        [firstname, lastname, password, email],
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


// Approve requests
const { exec } = require("child_process");

// Approve requests + trigger provisioning
app.put("/approve/:id", (req, res) => {

    const id = req.params.id;

    // Step 1: Get user details
    db.query(
        "SELECT first_name, last_name, password, email FROM requests WHERE id=?",
        [id],
        (err, result) => {

            if (err || result.length === 0) {
                return res.status(500).json({
                    message: "User not found or DB error"
                });
            }

            const user = result[0];

            const username = user.first_name;
            const password = user.password;

            // Step 2: Update status first
            db.query(
                "UPDATE requests SET status='Approved' WHERE id=?",
                [id],
                (err2) => {

                    if (err2) {
                        return res.status(500).json({
                            message: "Status update failed"
                        });
                    }

                    // Step 3: Trigger script
                    const cmd = `python3 /home/ubuntu/scripts/user_onboarding.py "${username}" "${password}"`;

                    exec(cmd, (error, stdout, stderr) => {

                        if (error) {
                            console.error("Script error:", error);
                            return;
                        }

                        console.log("Script output:", stdout);
                    });

                    res.json({
                        message: "Approved + Provisioning started"
                    });

                }
            );
        }
    );
});


/*app.put("/approve/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "UPDATE requests SET status='Approved' WHERE id=?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({
                message: "Request approved"
            });

        }
    );

});*/


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




app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

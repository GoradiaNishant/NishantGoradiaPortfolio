// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCoR7gz7gmmOfoxdmZsv5T8VUk59_Dt_RA",
    authDomain: "portfolio-8cbf9.firebaseapp.com",
    projectId: "portfolio-8cbf9",
    storageBucket: "portfolio-8cbf9.firebasestorage.app",
    messagingSenderId: "938666488742",
    appId: "1:938666488742:web:457b583ce8808e4f915567",
    measurementId: "G-3S0MZ0123P"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firestore
let db;
try {
    db = firebase.firestore();
} catch (error) {
    console.error('❌ Firestore initialization error:', error);
}

// Firebase Database Functions
const FirebaseDB = {
    // Test Firebase connection
    async testConnection() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase is not loaded');
                return false;
            }

            if (!db) {
                console.error('❌ Firestore is not initialized');
                return false;
            }

            // Try to access a simple collection to test connection
            try {
                await db.collection('portfolio').limit(1).get();
                return true;
            } catch (firestoreError) {
                console.error('❌ Firestore access failed:', firestoreError);
                return false;
            }
        } catch (error) {
            console.error('❌ Firebase connection failed:', error);
            return false;
        }
    },
    // Save portfolio data
    async savePortfolioData(data) {
        try {
            await db.collection('portfolio').doc('main').set(data);
            return true;
        } catch (error) {
            console.error('❌ Error saving portfolio data:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return false;
        }
    },

    // Get portfolio data
    async getPortfolioData() {
        try {
            const doc = await db.collection('portfolio').doc('main').get();
            if (doc.exists) {
                return doc.data();
            } else {

                return {};
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            return {};
        }
    },

    // Save projects
    async saveProjects(projects) {
        try {
            await db.collection('portfolio').doc('projects').set({ projects: projects });
            return true;
        } catch (error) {
            console.error('❌ Error saving projects:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return false;
        }
    },

    // Get projects
    async getProjects() {
        try {
            const doc = await db.collection('portfolio').doc('projects').get();
            if (doc.exists && doc.data().projects) {
                return doc.data().projects;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    },

    // Add single project
    async addProject(project) {
        try {
            const projects = await this.getProjects();
            projects.push(project);
            await this.saveProjects(projects);

            return true;
        } catch (error) {
            console.error('❌ Error adding project:', error);
            return false;
        }
    },

    // Update single project
    async updateProject(index, project) {
        try {
            const projects = await this.getProjects();
            projects[index] = project;
            await this.saveProjects(projects);

            return true;
        } catch (error) {
            console.error('Error updating project:', error);
            return false;
        }
    },

    // Delete single project
    async deleteProject(index) {
        try {
            const projects = await this.getProjects();
            projects.splice(index, 1);
            await this.saveProjects(projects);

            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    },


}; 
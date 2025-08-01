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
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firestore
let db;
try {
    db = firebase.firestore();
    console.log('✅ Firestore initialized successfully');
} catch (error) {
    console.error('❌ Firestore initialization error:', error);
}

// Firebase Database Functions
const FirebaseDB = {
    // Test Firebase connection
    async testConnection() {
        try {
            console.log('🔍 Testing Firebase connection...');
            
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase is not loaded');
                return false;
            }
            
            if (!db) {
                console.error('❌ Firestore is not initialized');
                return false;
            }
            
            const testDoc = await db.collection('test').doc('connection').get();
            console.log('✅ Firebase connection successful');
            return true;
        } catch (error) {
            console.error('❌ Firebase connection failed:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return false;
        }
    },
    // Save portfolio data
    async savePortfolioData(data) {
        try {
            console.log('Attempting to save portfolio data:', data);
            await db.collection('portfolio').doc('main').set(data);
            console.log('✅ Portfolio data saved to Firebase successfully');
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
                console.log('Portfolio data loaded from Firebase');
                return doc.data();
            } else {
                console.log('No portfolio data found in Firebase');
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
            console.log('🔍 Attempting to save projects to Firebase');
            console.log('🔍 Number of projects:', projects.length);
            console.log('🔍 Latest project tech stack:', projects[projects.length - 1]?.techStack);
            console.log('🔍 Latest project development process:', projects[projects.length - 1]?.developmentProcess);
            
            await db.collection('portfolio').doc('projects').set({ projects: projects });
            console.log('✅ Projects saved to Firebase successfully');
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
                console.log('Projects loaded from Firebase');
                return doc.data().projects;
            } else {
                console.log('No projects found in Firebase');
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
            console.log('🔍 Firebase received project with tech stack:', project.techStack);
            console.log('🔍 Firebase received project with development process:', project.developmentProcess);
            console.log('🔍 Firebase received full project object:', JSON.stringify(project, null, 2));
            console.log('🔍 Project object keys:', Object.keys(project));
            
            const projects = await this.getProjects();
            console.log('🔍 Existing projects count:', projects.length);
            projects.push(project);
            console.log('🔍 Projects after adding new one:', projects.length);
            await this.saveProjects(projects);
            console.log('✅ Project added to Firebase successfully');
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
            console.log('Project updated in Firebase');
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
            console.log('Project deleted from Firebase');
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    },


}; 
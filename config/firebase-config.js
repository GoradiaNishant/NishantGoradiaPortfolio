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

    // Save projects (legacy method - keeping for backward compatibility)
    async saveProjects(projects) {
        try {
            // Check document size before saving
            const projectsData = { projects: projects };
            const dataSize = new Blob([JSON.stringify(projectsData)]).size;
            console.log(`📊 Projects document size: ${dataSize} bytes (${(dataSize / 1024 / 1024).toFixed(2)} MB)`);
            
            if (dataSize > 900000) { // Leave some buffer below 1MB limit
                console.warn('⚠️ Projects document is getting large. Switching to individual project documents.');
                // Switch to individual project storage
                return await this.saveProjectsIndividually(projects);
            }
            
            await db.collection('portfolio').doc('projects').set(projectsData);
            return true;
        } catch (error) {
            console.error('❌ Error saving projects:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return false;
        }
    },

    // Save projects as individual documents (new method)
    async saveProjectsIndividually(projects) {
        try {
            console.log('🔄 Switching to individual project documents...');
            
            // Save each project as a separate document
            const batch = db.batch();
            
            // Clear existing projects collection
            const existingProjects = await db.collection('projects').get();
            existingProjects.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Add each project as individual document
            projects.forEach((project, index) => {
                const projectRef = db.collection('projects').doc(`project-${index}`);
                batch.set(projectRef, project);
            });
            
            await batch.commit();
            console.log('✅ Projects saved as individual documents');
            return true;
        } catch (error) {
            console.error('❌ Error saving projects individually:', error);
            return false;
        }
    },

    // Get projects
    async getProjects() {
        try {
            // Get all individual project documents
            const projectsSnapshot = await db.collection('projects').get();
            if (!projectsSnapshot.empty) {
                const projects = [];
                
                // Collect all projects with their indices
                projectsSnapshot.docs.forEach(doc => {
                    const index = parseInt(doc.id.replace('project-', ''));
                    projects.push({
                        index: index,
                        data: doc.data()
                    });
                });
                
                // Sort by index to maintain order
                projects.sort((a, b) => a.index - b.index);
                
                // Return only the project data in correct order
                const orderedProjects = projects.map(project => project.data);
                console.log(`📁 Loaded ${orderedProjects.length} projects from individual documents`);
                return orderedProjects;
            }
            
            // Fallback to legacy method (single document)
            const doc = await db.collection('portfolio').doc('projects').get();
            if (doc.exists && doc.data().projects) {
                console.log('📁 Loaded projects from legacy single document');
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
            // Optimize screenshots before saving
            if (project.screenshots && project.screenshots.length > 0) {
                project.screenshots = await this.optimizeScreenshots(project.screenshots);
            }
            
            // Get the next available index
            const nextIndex = await this.getNextProjectIndex();
            
            // Save as individual document with sequential index
            await db.collection('projects').doc(`project-${nextIndex}`).set(project);
            console.log(`✅ Project added as individual document: project-${nextIndex}`);

            return true;
        } catch (error) {
            console.error('❌ Error adding project:', error);
            return false;
        }
    },

    // Get next available project index
    async getNextProjectIndex() {
        try {
            const projectsSnapshot = await db.collection('projects').get();
            if (projectsSnapshot.empty) {
                return 0; // First project
            }
            
            // Find the highest index
            let maxIndex = -1;
            projectsSnapshot.docs.forEach(doc => {
                const index = parseInt(doc.id.replace('project-', ''));
                if (index > maxIndex) {
                    maxIndex = index;
                }
            });
            
            return maxIndex + 1; // Next available index
        } catch (error) {
            console.error('❌ Error getting next project index:', error);
            return 0; // Fallback to 0
        }
    },

    // Update single project
    async updateProject(index, project) {
        try {
            // Optimize screenshots before saving
            if (project.screenshots && project.screenshots.length > 0) {
                project.screenshots = await this.optimizeScreenshots(project.screenshots);
            }
            
            // Get all projects to find the correct document ID for the given index
            const projectsSnapshot = await db.collection('projects').get();
            const projects = [];
            
            // Collect all projects with their indices
            projectsSnapshot.docs.forEach(doc => {
                const docIndex = parseInt(doc.id.replace('project-', ''));
                projects.push({
                    index: docIndex,
                    docId: doc.id,
                    data: doc.data()
                });
            });
            
            // Sort by index to maintain order
            projects.sort((a, b) => a.index - b.index);
            
            // Find the project at the specified array index
            if (index >= 0 && index < projects.length) {
                const targetProject = projects[index];
                const documentId = targetProject.docId;
                
                // Update the specific document
                await db.collection('projects').doc(documentId).set(project);
                console.log(`✅ Project updated: ${documentId} (array index: ${index}, doc index: ${targetProject.index})`);

                return true;
            } else {
                console.error(`❌ Invalid project index: ${index}. Total projects: ${projects.length}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Error updating project:', error);
            return false;
        }
    },

    // Delete single project
    async deleteProject(index) {
        try {
            // Get all projects to find the correct document ID for the given index
            const projectsSnapshot = await db.collection('projects').get();
            const projects = [];
            
            // Collect all projects with their indices
            projectsSnapshot.docs.forEach(doc => {
                const docIndex = parseInt(doc.id.replace('project-', ''));
                projects.push({
                    index: docIndex,
                    docId: doc.id,
                    data: doc.data()
                });
            });
            
            // Sort by index to maintain order
            projects.sort((a, b) => a.index - b.index);
            
            // Find the project at the specified array index
            if (index >= 0 && index < projects.length) {
                const targetProject = projects[index];
                const documentId = targetProject.docId;
                
                // Delete the specific document
                await db.collection('projects').doc(documentId).delete();
                console.log(`✅ Project deleted: ${documentId} (array index: ${index}, doc index: ${targetProject.index})`);

                return true;
            } else {
                console.error(`❌ Invalid project index: ${index}. Total projects: ${projects.length}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            return false;
        }
    },



    // Optimize screenshots to reduce size
    async optimizeScreenshots(screenshots) {
        console.log('🖼️ Optimizing screenshots...');
        const optimizedScreenshots = [];
        
        for (let i = 0; i < screenshots.length; i++) {
            const screenshot = screenshots[i];
            const optimizedScreenshot = { ...screenshot };
            
            // If it's a base64 data URL, compress it
            if (screenshot.url && screenshot.url.startsWith('data:image/')) {
                try {
                    const compressedUrl = await this.compressImage(screenshot.url);
                    optimizedScreenshot.url = compressedUrl;
                    
                    const originalSize = screenshot.url.length;
                    const compressedSize = compressedUrl.length;
                    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                    
                    console.log(`📸 Screenshot ${i + 1}: ${compressionRatio}% size reduction (${originalSize} → ${compressedSize} bytes)`);
                } catch (error) {
                    console.warn(`⚠️ Failed to compress screenshot ${i + 1}:`, error);
                    // Keep original if compression fails
                }
            }
            
            optimizedScreenshots.push(optimizedScreenshot);
        }
        
        return optimizedScreenshots;
    },

    // Compress image data URL
    async compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            
            img.onerror = reject;
            img.src = dataUrl;
        });
    },

    // Get document size in bytes
    getDocumentSize(data) {
        return new Blob([JSON.stringify(data)]).size;
    },

    // Check if document would exceed size limit
    wouldExceedSizeLimit(data, limit = 900000) {
        const size = this.getDocumentSize(data);
        return size > limit;
    },

    // Migrate from single document to individual documents
    async migrateToIndividualDocuments() {
        try {
            console.log('🔄 Starting migration to individual project documents...');
            
            // Get projects from legacy storage
            const legacyDoc = await db.collection('portfolio').doc('projects').get();
            if (!legacyDoc.exists || !legacyDoc.data().projects) {
                console.log('✅ No legacy projects to migrate');
                return true;
            }
            
            const projects = legacyDoc.data().projects;
            console.log(`📁 Found ${projects.length} projects to migrate`);
            
            // Save as individual documents
            const batch = db.batch();
            projects.forEach((project, index) => {
                const projectRef = db.collection('projects').doc(`project-${index}`);
                batch.set(projectRef, project);
            });
            
            await batch.commit();
            console.log('✅ Migration completed successfully');
            
            // Optionally, you can delete the legacy document
            // await db.collection('portfolio').doc('projects').delete();
            
            return true;
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return false;
        }
    },

}; 
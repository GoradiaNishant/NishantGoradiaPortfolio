// Local Storage Configuration for Development
const LocalDB = {
    // Test local storage connection
    testConnection() {
        try {
            console.log('🔍 Testing Local Storage connection...');
            localStorage.setItem('test', 'connection');
            localStorage.removeItem('test');
            console.log('✅ Local Storage connection successful');
            return true;
        } catch (error) {
            console.error('❌ Local Storage connection failed:', error);
            return false;
        }
    },

    // Save portfolio data
    savePortfolioData(data) {
        try {
            console.log('Attempting to save portfolio data:', data);
            localStorage.setItem('portfolioData', JSON.stringify(data));
            console.log('✅ Portfolio data saved to Local Storage successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving portfolio data:', error);
            return false;
        }
    },

    // Get portfolio data
    getPortfolioData() {
        try {
            const data = JSON.parse(localStorage.getItem('portfolioData') || '{}');
            console.log('Portfolio data loaded from Local Storage:', data);
            return data;
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            return {};
        }
    },

    // Save projects
    saveProjects(projects) {
        try {
            console.log('Attempting to save projects:', projects);
            localStorage.setItem('projects', JSON.stringify(projects));
            console.log('✅ Projects saved to Local Storage successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving projects:', error);
            return false;
        }
    },

    // Get projects
    getProjects() {
        try {
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            console.log('Projects loaded from Local Storage:', projects);
            return projects;
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    },

    // Add single project
    addProject(project) {
        try {
            const projects = this.getProjects();
            projects.push(project);
            this.saveProjects(projects);
            console.log('Project added to Local Storage');
            return true;
        } catch (error) {
            console.error('Error adding project:', error);
            return false;
        }
    },

    // Update single project
    updateProject(index, project) {
        try {
            const projects = this.getProjects();
            projects[index] = project;
            this.saveProjects(projects);
            console.log('Project updated in Local Storage');
            return true;
        } catch (error) {
            console.error('Error updating project:', error);
            return false;
        }
    },

    // Delete single project
    deleteProject(index) {
        try {
            const projects = this.getProjects();
            projects.splice(index, 1);
            this.saveProjects(projects);
            console.log('Project deleted from Local Storage');
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    }
};

// Use LocalDB instead of FirebaseDB for local development
const FirebaseDB = LocalDB; 
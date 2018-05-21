pipeline {
  agent {
    docker { image 'node:8.11.1-slim' }
  }
  stages {
    stage('test') {
      steps {
        sh 'node --version'
      }
    }
  }
}
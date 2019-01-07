pipeline {
  agent {
    docker {
      image 'node:8.15'
    }

  }
  stages {
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'npm run postinstall'
        sh 'npm run test'
        mail(subject: 'test', body: 'test', replyTo: '1965198272@qq.com', to: '1965198272@qq.com')
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
  post {
    always {
      echo 'This will always run'

    }

    success {
      mail(to: '1965198272@qq.com', subject: "successbul: ${currentBuild.fullDisplayName}", body: 'OK')
      echo 'This will run only if successful'

    }

    failure {
      echo 'This will run only if failed'

    }

    unstable {
      echo 'This will run only if the run was marked as unstable'

    }

    changed {
      echo 'This will run only if the state of the Pipeline has changed'
      echo 'For example, if the Pipeline was previously failing but is now successful'

    }

  }
}
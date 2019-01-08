pipeline {
  agent {
    docker {
      image 'node:8.15'
    }

  }
  stages {
    stage('Deploy') {
      input {
        message 'What is your deployment server?'
        id 'Confirm'
        parameters {
          string(name: 'id', defaultValue: 'aninxg', description: 'input your server ip')
        }
      }
      steps {
        echo "server ip : ${ip}"
      }
    }
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'npm run postinstall'
        sh 'npm run test'
        input(message: 'Test-input', id: 'myp', ok: 'test-ok', submitter: 'test-submmiter', submitterParameter: 'test-SubmitterParameter')
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
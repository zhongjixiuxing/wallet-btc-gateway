pipeline {
  agent any
  stages {
    stage('Test') {
      agent {
        docker {
            image 'node:8.15'
        }
      }
      steps {
        sh 'npm install'
        sh 'npm run postinstall'
        sh 'npm run test'
      }
    }
    stage('Deploy') {
          agent any
          steps {
            script {
              def deployTo = input(id: 'userInput', message: 'GOOOOOOOO', parameters: [
                [$class: 'ChoiceParameterDefinition', choices: ["none", "dev(localhost)", "production"], description: "What's the env of you want to deploy?", name: 'deployTo'],
              ])

              if (deployTo != 'dev(localhost)') {
                return echo ("deployment[${deployTo}] is un-support at now. nothing to do for the choice")
              }

              def deployCfg = [:]
              deployCfg.buildImageName = "btc-gateway:latest"
              deployCfg.sshHost = "192.168.1.104"
              deployCfg.sshUser = "root"
              deployCfg.sshPassword = ""
              deployCfg.customCommand = ""
              deployCfg.customEnv = ""

              while(true) {
                deployCfg = input(id: 'deployCfg', message: 'Publish Configure', parameters: [
                  [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.buildImageName}", description: "What's the build image name", name: 'buildImageName'],
                  [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshHost}", description: "SSH host of deployment server", name: 'sshHost'],
                  [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshUser}", description: "SSH user name", name: 'sshUser'],
                  [$class: 'StringParameterDefinition', defaultValue: "${deployCfg.sshPassword}", description: "SSH password", name: 'sshPassword'],
                  [$class: 'TextParameterDefinition', defaultValue: "${deployCfg.customCommand}", description: "custom define exec publish command(option)", name: 'customCommand'],
                  [$class: 'TextParameterDefinition', defaultValue: "${deployCfg.customEnv}", description: "custom define server env(option)", name: 'customEnv'],
                ])

                if (!deployCfg.buildImageName || deployCfg.buildImageName.trim() == "") {
                  input(message: 'Invalid build image name')
                  continue
                } else {
                  deployCfg.buildImageName = deployCfg.buildImageName.trim()
                }

                if (!deployCfg.sshHost || deployCfg.sshHost.trim() == "") {
                  input(message: 'Invalid SSH host!')
                  continue
                } else {
                  deployCfg.sshHost = deployCfg.sshHost.trim()
                }

                if (!deployCfg.sshUser || deployCfg.sshUser.trim() == "") {
                  input(message: 'Invalid SSH user!')
                  continue
                } else {
                  deployCfg.sshUser = deployCfg.sshUser.trim()
                }

                deployCfg.sshPassword = deployCfg.sshPassword.trim()
                if (deployCfg.customCommand) {
                    deployCfg.customCommand = deployCfg.customCommand.trim()
                }

                if (deployCfg.customEnv) {
                    deployCfg.customEnv = deployCfg.customEnv.trim()
                }

                break
              }


              def customImage = docker.build("${deployCfg.buildImageName}")

              def remote = [:]
              remote.name = deployCfg.sshHost
              remote.host = deployCfg.sshHost
              remote.user = deployCfg.sshUser
              remote.password = deployCfg.sshPassword
              remote.allowAnyHosts = true

              def command = deployCfg.customCommand
              if (!command || command == "") {
                command = "docker run -id ${deployCfg.customEnv} --name btc-gateway -p 5000:3000 ${deployCfg.buildImageName}"
              } else {
                deployCfg.customEnv = 'docker run ' + deployCfg.customEnv
                command = command.replace('docker run ', deployCfg.customEnv)
              }



              try {
                sshCommand remote:remote, command:'docker rm -f btc-gateway'
              } catch (e) {
                println("remove btc-gateway error : ")
                println(e)
              }

              sleep 5

              try {
                sshCommand remote:remote, command:command
              } catch (exec) {
                println("happen error")
                println(exec)

                throw exec
              }
            }

          }
        }
  }
  environment {
    NODE_ENV = 'test'
  }
  post {
    success {
      mail(to: '1965198272@qq.com', subject: "successbul: ${currentBuild.fullDisplayName}", body: 'OK')

    }

    failure {
      mail(to: '1965198272@qq.com', subject: "failure: ${currentBuild.fullDisplayName}", body: 'failure')

    }

  }
}
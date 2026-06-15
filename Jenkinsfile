pipeline {

agent any

environment {

    BACKEND_IMAGE = "dhanushmyt/ecommerce-backend"
    FRONTEND_IMAGE = "dhanushmyt/ecommerce-frontend"

    IMAGE_TAG = "${BUILD_NUMBER}"
}

stages {

    stage('Checkout Code') {

        steps {

            git branch: 'main',
            credentialsId: 'git',
            url: 'https://github.com/Dhanush-2505/ecommerce-devops-project.git'
        }
    }

    stage('Verify Files') {

        steps {

            sh '''
            pwd
            ls -la
            ls -la backend
            ls -la frontend
            '''
        }
    }

    stage('Build Backend Image') {

        steps {

            sh '''
            docker build -t $BACKEND_IMAGE:$IMAGE_TAG ./backend

            docker tag \
            $BACKEND_IMAGE:$IMAGE_TAG \
            $BACKEND_IMAGE:latest
            '''
        }
    }

    stage('Build Frontend Image') {

        steps {

            sh '''
            docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ./frontend

            docker tag \
            $FRONTEND_IMAGE:$IMAGE_TAG \
            $FRONTEND_IMAGE:latest
            '''
        }
    }

    stage('DockerHub Login') {

        steps {

            withCredentials([
                usernamePassword(
                    credentialsId: 'dockerhup',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )
            ]) {

                sh '''
                echo "$DOCKER_PASS" | docker login \
                -u "$DOCKER_USER" \
                --password-stdin
                '''
            }
        }
    }

    stage('Push Backend Image') {

        steps {

            sh '''
            docker push $BACKEND_IMAGE:$IMAGE_TAG
            docker push $BACKEND_IMAGE:latest
            '''
        }
    }

    stage('Push Frontend Image') {

        steps {

            sh '''
            docker push $FRONTEND_IMAGE:$IMAGE_TAG
            docker push $FRONTEND_IMAGE:latest
            '''
        }
    }
}

post {

    success {

        echo 'SUCCESS - Images pushed to DockerHub'
    }

    failure {

        echo 'FAILED - Check Console Output'
    }
}

}

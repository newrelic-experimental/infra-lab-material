from locust import HttpUser, TaskSet, task

class UserBehavior(TaskSet):
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        print('Starting')


    @task
    def login(self):
        self.client.get('/')
        # credentials = {
        #         'name': 'user',
        #         'password': 'password'
        #         }
        # res = self.client.post('/api/user/login', json=credentials)
        # print('login {}'.format(res.status_code)) 


    # @task
    # def load(self):
    #     self.client.get('/')
    #     user = self.client.get('/api/user/uniqueid').json()
    #     uniqueid = user.get('uuid', 'not found')
    #     print('User {}'.format(uniqueid))



class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    min_wait = 1000
    max_wait = 5000

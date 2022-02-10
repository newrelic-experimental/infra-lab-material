from locust import HttpUser, TaskSet, task
from random import randint

class UserBehavior(TaskSet):
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        print('Starting')

    @task
    def login(self):
        credentials = {
                'name': 'user',
                'password': 'password'
                }
        res = self.client.post('/api/user/login', json=credentials)
        print('login {}'.format(res.status_code))


    @task
    def load(self):
        self.client.get('/')
        user = self.client.get('/api/user/uniqueid').json()
        uniqueid = user.get('uuid', 'not found')
        print('User {}'.format(uniqueid))

            # vote for item
        if randint(1, 10) <= 3:
            self.client.put('/api/ratings/api/rate/{}/{}'.format(['sku'], randint(1, 5)))


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    min_wait = 1000
    max_wait = 5000

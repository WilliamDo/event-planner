from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/event/<int:event_id>")
def event(event_id):
    return render_template('event.html', event_id=event_id)

@app.route("/event/create")
def event_new():
    return render_template('create.html')

@app.route("/login")
def login():
    return render_template('login.html')

if __name__ == "__main__":
    app.run(debug=True)

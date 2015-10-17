from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/event/<int:event_id>")
def event(event_id):
    return render_template('event.html', event_id=event_id)

if __name__ == "__main__":
    app.run(debug=True)

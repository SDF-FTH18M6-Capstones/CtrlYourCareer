from flask import jsonify
from app import db

def init_routes(app):
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            db.session.execute(db.text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            db_status = f"disconnected: {str(e)}"

        return jsonify({
            "status": "success",
            "message": "Backend service is up and running",
            "database": db_status
        }), 200
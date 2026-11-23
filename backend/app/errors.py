from flask import jsonify
from sqlalchemy.exc import IntegrityError


def register_error_handlers(app):

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad request",
            "message": "Please check the information you submitted."
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "error": "Unauthorized",
            "message": "Please log in to access this resource."
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "error": "Forbidden",
            "message": "You do not have permission to perform this action."
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not found",
            "message": "The requested resource does not exist."
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method not allowed",
            "message": "This HTTP method is not supported."
        }), 405

    @app.errorhandler(IntegrityError)
    def integrity_error(error):
        from app.extensions import db

        db.session.rollback()

        return jsonify({
            "error": "Database conflict",
            "message": "The submitted data conflicts with an existing record."
        }), 409

    @app.errorhandler(500)
    def internal_server_error(error):
        from app.extensions import db

        db.session.rollback()

        return jsonify({
            "error": "Internal server error",
            "message": "Something went wrong on the server."
        }), 500

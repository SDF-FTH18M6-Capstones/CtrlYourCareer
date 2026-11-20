from marshmallow import Schema, fields, validate, ValidationError


class SkillSchema(Schema):

    id = fields.Int(dump_only=True)

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    category = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    description = fields.Str(
        load_default=""
    )

    created_at = fields.DateTime(dump_only=True)


class CareerSchema(Schema):

    id = fields.Int(dump_only=True)

    title = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=150)
    )

    description = fields.Str(
        required=True,
        validate=validate.Length(min=10)
    )

    category = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    created_at = fields.DateTime(dump_only=True)


# One skill
skill_schema = SkillSchema()

# Multiple skills
skills_schema = SkillSchema(many=True)

# One career
career_schema = CareerSchema()

# Multiple careers
careers_schema = CareerSchema(many=True)

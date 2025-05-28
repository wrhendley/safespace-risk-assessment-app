from flask_marshmallow import Marshmallow
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_migrate import Migrate
from flask_cors import CORS

ma = Marshmallow()
limiter = Limiter(key_func=get_remote_address,
                default_limits=["200 per day", "50 per hour"])

cache = Cache()

migrate = Migrate()

cors = CORS()
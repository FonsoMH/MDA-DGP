import psycopg2 as pg
import psycopg2.extras as extras

from flask import current_app, g


def get_db():
    if 'db' not in g:
        g.db = pg.connect(
            database=current_app.config['POSTGRES_DB'],
            user=current_app.config['POSTGRES_USER'],
            password=current_app.config['POSTGRES_PASSWORD'],
            host=current_app.config['POSTGRES_HOST'],
            port=current_app.config.get('POSTGRES_PORT', 5432)
        )
        g.db.autocommit = False
    return g.db

def get_db_cursor():
    db = get_db()
    return db.cursor(cursor_factory=extras.RealDictCursor)

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    res = exec_script('./sql/example.sql')

    if not res:
        mensaje = "Ha ocurrido un error al inicializar la base de datos"
    else:
        mensaje = "Base de datos inicializada"
    return mensaje

def init_app(app):
    app.teardown_appcontext(close_db)

def exec_script(script):
    with current_app.open_resource(script) as f:
        data = f.read().decode("utf-8")
        cur = get_db_cursor()
        try:
            cur.execute(data)
            cur.execute("COMMIT;")
            return True
        except:
            cur.execute("ROLLBACK;")
            return False
        finally:
            cur.close()
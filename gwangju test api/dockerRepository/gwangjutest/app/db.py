from .mypackage import module    

# @는 hostName, /db 이름
DATABASEURL = f"mysql+pymysql://{module.db_userName}:{module.db_userPassword}@{module.mariadb_container_name}:{module.db_port}/{module.db_tableName}"

ENGINE = module.create_engine(DATABASEURL, echo=True)

session = module.scoped_session(module.sessionmaker(autocommit=False, autoflush=False, bind=ENGINE))

Base = module.declarative_base()
Base.query = session.query_property()


from sqlalchemy import insert, select, update

from shared import sqlx

from .models import GeneralModel, GeneralTable


async def general_get() -> GeneralModel:
    row = await sqlx.fetch_one(
        select(GeneralTable)
        .where(GeneralTable.general_id == 0)
    )

    if row is None:
        await sqlx.execute(insert(GeneralTable), {'general_id': 0})
        return GeneralModel(general_id=0, tags=[])

    return GeneralModel(**row)


async def general_update(**values: dict):
    await sqlx.execute(
        update(GeneralTable).where(GeneralTable.general_id == 0),
        values
    )

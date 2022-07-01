from .. import GenerateFigSpecController


def load(app):
    app.handler.register(GenerateFigSpecController)

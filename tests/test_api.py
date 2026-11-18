"""Testes de validação sem conexão ao banco."""
import unittest
from unittest.mock import patch
from app import app, centavos

class TesteAPI(unittest.TestCase):
    def setUp(self):
        self.client=app.test_client()

    def test_conversao_moeda(self):
        self.assertEqual(centavos('3.50'),350)
        self.assertEqual(centavos('45.00'),4500)

    def test_pedido_sem_cliente(self):
        r=self.client.post('/api/pedidos',json={'itens':[]})
        self.assertEqual(r.status_code,400)

    def test_pedido_sem_itens(self):
        r=self.client.post('/api/pedidos',json={'cliente':'Teste','telefone':'54999999999','endereco':'Retirada','itens':[]})
        self.assertEqual(r.status_code,400)

    def test_admin_exige_token(self):
        with patch('app.autorizado',return_value=False):
            self.assertEqual(self.client.get('/api/admin/pedidos').status_code,401)

if __name__=='__main__':unittest.main()

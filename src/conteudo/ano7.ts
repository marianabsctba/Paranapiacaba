import type { Ano } from './tipos';

export const ano7: Ano = {
  "numero": 7,
  "titulo": "O Grande Apagão",
  "resumo": "O Nulo derruba as redes das escolas. Com Active Directory, Kerberos, hunting e recuperação, a turma reencontra Lena e Rui, reconstrói a confiança e conclui a saga. Agora são dez capítulos, com investigação e decisões adicionais antes do final.",
  "capitulos": [
    {
      "id": "a7c01",
      "titulo": "A Última Volta",
      "mes": "Setembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "No sétimo ano, a neblina parece mais pesada. O Nulo prepara outro apagão, e a equipe começa pelo inventário de identidades."
            ],
            [
              "nanda",
              "Este ano não tem herói solitário. Tem procedimentos, registro de evidências e café."
            ],
            [
              "enzo",
              "Eu trouxe os documentos do contrato do meu pai. Sem propaganda desta vez."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_1",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "ruth",
          "titulo": "Domínio e controlador",
          "atributo": "sistemas",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "ruth",
              "Hoje: domínio e controlador. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "O Active Directory Domain Services centraliza informações sobre usuários, grupos e computadores em um domínio. Controladores de domínio hospedam e replicam o diretório.",
            "Autenticação, DNS, disponibilidade e backup de controladores merecem atenção especial. Replicação não substitui backup."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Quem autentica identidades de domínio?",
              "opcoes": [
                "Controlador de domínio",
                "Servidor DNS público",
                "WAF"
              ],
              "correta": 0,
              "explicacao": "O controlador presta serviços de diretório."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Serviço de diretório é ___.",
              "aceitos": [
                "AD DS"
              ],
              "explicacao": "O conceito esperado é AD DS."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_2",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "otavio",
          "titulo": "Grupos e GPO",
          "atributo": "sistemas",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "otavio",
              "Hoje: grupos e gpo. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Grupos permitem organizar direitos e acessos por função. GPO aplica configurações a objetos dentro de escopos determinados.",
            "Menor privilégio, testes de política e separação de contas administrativas previnem alterações massivas acidentais."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Para que serve uma GPO?",
              "opcoes": [
                "Distribuir políticas e configurações",
                "Descobrir senhas",
                "Cifrar pacotes HTTP"
              ],
              "correta": 0,
              "explicacao": "Uma GPO administra configurações no domínio."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Objeto de política de grupo é ___.",
              "aceitos": [
                "GPO"
              ],
              "explicacao": "O conceito esperado é GPO."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 1: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'A neblina revela o Torneio das Band...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c02",
      "titulo": "O Segredo dos Tíquetes",
      "mes": "Outubro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "heitor",
              "O código de Lena faz referência aos tíquetes do domínio. Antes de agir, precisam entender a confiança do Kerberos."
            ],
            [
              "tati",
              "TGT, TGS, krbtgt. Até as siglas estão tensas."
            ],
            [
              "voce",
              "A Camada 6 trouxe a localização. Vamos encontrar minha mãe com segurança."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_3",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "heitor",
          "titulo": "Kerberos básico",
          "atributo": "cripto",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "heitor",
              "Hoje: kerberos básico. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Kerberos usa tíquetes para autenticação. Um TGT obtido do KDC permite solicitar TGS para serviços autorizados.",
            "Relógios sincronizados e proteção das credenciais são essenciais. No AD, o controlador de domínio atua como KDC."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual tíquete permite pedir acesso a serviços?",
              "opcoes": [
                "TGT",
                "Cookie",
                "CSP"
              ],
              "correta": 0,
              "explicacao": "O TGT permite solicitar tíquetes de serviço."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Tíquete de serviço é ___.",
              "aceitos": [
                "TGS"
              ],
              "explicacao": "O conceito esperado é TGS."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_4",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "heitor",
          "titulo": "A conta krbtgt",
          "atributo": "cripto",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "heitor",
              "Hoje: a conta krbtgt. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "O segredo da conta krbtgt protege tíquetes de concessão em um domínio AD. Se for comprometido, a confiança do domínio pode ser ameaçada.",
            "A rotação deve seguir um plano com replicação e validade de tíquetes em mente. Em resposta a comprometimento, geralmente se realizam duas rotações coordenadas."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que deve orientar a rotação da krbtgt?",
              "opcoes": [
                "Plano de recuperação e replicação",
                "Cor do painel",
                "Velocidade do mouse"
              ],
              "correta": 0,
              "explicacao": "Mudança precipitada pode interromper serviços."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Conta ligada à segurança dos TGTs é ___.",
              "aceitos": [
                "krbtgt"
              ],
              "explicacao": "O conceito esperado é krbtgt."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 2: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'A loja do torneio é fictícia. Compr...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c03",
      "titulo": "Apagão",
      "mes": "Novembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "O segundo Grande Apagão começa. Escolas perdem autenticação. Brasília publica uma nota que não explica nada."
            ],
            [
              "nulo",
              "Um sistema conectado é uma promessa de dependência."
            ],
            [
              "iolanda",
              "E uma recuperação bem feita é uma promessa cumprida."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_5",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "nanda",
          "titulo": "NTLM e hashes",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "nanda",
              "Hoje: ntlm e hashes. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "NTLM é protocolo legado de autenticação. Em alguns cenários, o material de hash roubado pode ser abusado para se autenticar sem conhecer a senha original.",
            "Reduzir dependência de NTLM, proteger credenciais privilegiadas, segmentar redes e acompanhar autenticações anômalas ajudam a mitigar pass-the-hash."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual proteção é indicada?",
              "opcoes": [
                "Reduzir NTLM e proteger credenciais",
                "Compartilhar hashes",
                "Desligar monitoramento"
              ],
              "correta": 0,
              "explicacao": "Protocolos legados e credenciais expostas ampliam riscos."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Protocolo legado é ___.",
              "aceitos": [
                "NTLM"
              ],
              "explicacao": "O conceito esperado é NTLM."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_6",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "nanda",
          "titulo": "Kerberoasting",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "nanda",
              "Hoje: kerberoasting. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Kerberoasting envolve abuso de tíquetes de serviço para tentar descobrir offline segredos fracos de contas de serviço. Entender o mecanismo ajuda a defender.",
            "Prefira contas gerenciadas, senhas robustas, acesso mínimo e monitore solicitações incomuns de tíquetes de serviço, como eventos Windows 4769."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que mitiga o risco?",
              "opcoes": [
                "Senhas robustas e contas gerenciadas",
                "Senha padrão",
                "Desabilitar logs"
              ],
              "correta": 0,
              "explicacao": "Proteger contas de serviço dificulta ataques."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Evento de tíquete de serviço é ___.",
              "aceitos": [
                "4769"
              ],
              "explicacao": "O conceito esperado é 4769."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 3: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "duelo",
          "lugar": "a7_centro_crise",
          "oponente": "nulo",
          "titulo": "Duelo de investigação",
          "antes": [
            [
              "narrador",
              "Três rodadas técnicas. A precisão vale mais que gritar feitiços."
            ]
          ],
          "rodadas": [
            {
              "tipo": "multipla",
              "pergunta": "Que atitude respeita o trabalho de cibersegurança?",
              "opcoes": [
                "Trabalhar nos sistemas autorizados",
                "Invadir infraestrutura alheia"
              ],
              "correta": 0,
              "explicacao": "A prática técnica exige autorização."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Um registro de evento útil para investigação é um ___.",
              "aceitos": [
                "log"
              ],
              "explicacao": "Logs ajudam a reconstituir ocorrências."
            },
            {
              "tipo": "multipla",
              "pergunta": "Como confirmar se uma correção funcionou?",
              "opcoes": [
                "Testar e observar evidências",
                "Confiar no slide bonito"
              ],
              "correta": 0,
              "explicacao": "Validação técnica é essencial."
            }
          ],
          "vitoria": [
            [
              "nanda",
              "Uma hipótese testada e uma ameaça a menos."
            ]
          ],
          "derrota": [
            [
              "heitor",
              "Errar no laboratório é aprender para a resposta real."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Achei que cookie fosse só aquele av...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c04",
      "titulo": "O Reencontro",
      "mes": "Dezembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "Na Oficina do Bem-te-vi, a porta abre. Lena está viva, cercada de mapas e registros preservados."
            ],
            [
              "a7_lena",
              "{nome}. Eu queria ter voltado antes. Passei esses anos impedindo que o Nulo encontrasse a chave."
            ],
            [
              "voce",
              "Vamos salvar as escolas. E encontrar o pai."
            ],
            [
              "a7_lena",
              "Juntos. Sem atalhos."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_7",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "heitor",
          "titulo": "Golden Ticket",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "heitor",
              "Hoje: golden ticket. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Golden Ticket é um TGT falsificado a partir de segredo comprometido da conta krbtgt. É ameaça grave para autenticação do domínio.",
            "A defesa combina proteção dos controladores, caça a anomalias, investigação e recuperação da confiança. Não é uma técnica de teste fora de laboratório isolado."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que está associado ao Golden Ticket?",
              "opcoes": [
                "Segredo da conta krbtgt",
                "Cookie de marketing",
                "DNS cache"
              ],
              "correta": 0,
              "explicacao": "Comprometimento da krbtgt permite forjar tíquetes."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Tíquete Kerberos falsificado é ___.",
              "aceitos": [
                "Golden Ticket"
              ],
              "explicacao": "O conceito esperado é Golden Ticket."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_8",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "iolanda",
          "titulo": "Administração segura",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "iolanda",
              "Hoje: administração segura. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Contas administrativas separadas, estações de administração dedicadas e níveis de confiança ajudam a proteger componentes críticos.",
            "MFA quando possível, menor privilégio e restrições de logon reduzem exposição de credenciais privilegiadas."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual é uma boa prática?",
              "opcoes": [
                "Separar contas comuns e administrativas",
                "Usar Domain Admin para tudo",
                "Compartilhar credenciais"
              ],
              "correta": 0,
              "explicacao": "Administração separada diminui superfície de ataque."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Princípio de acesso mínimo é ___.",
              "aceitos": [
                "menor privilégio"
              ],
              "explicacao": "O conceito esperado é menor privilégio."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 4: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Primeira rodada do torneio. Você e ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c05",
      "titulo": "Persistências",
      "mes": "Janeiro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "O SOC encontra persistência em estações e servidores, mas uma rotina legítima parece suspeita. A turma precisa distinguir fatos."
            ],
            [
              "nanda",
              "Nem todo cron é criminoso. Nem toda tarefa agendada é inocente. Investigação, pessoal."
            ],
            [
              "caua",
              "Já parei de querer resolver tudo com fita isolante. Quase tudo."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_9",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "otavio",
          "titulo": "Persistência no Registro",
          "atributo": "forense",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "otavio",
              "Hoje: persistência no registro. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Chaves Run do Registro podem executar programas após logon. São usadas por programas legítimos, mas também podem sustentar persistência maliciosa.",
            "Investigue caminho, assinatura, usuário, data e origem antes de remover uma entrada. Remoção indiscriminada pode quebrar aplicações confiáveis."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que fazer com uma Run key suspeita?",
              "opcoes": [
                "Correlacionar evidências antes de agir",
                "Apagar todas",
                "Ignorar sempre"
              ],
              "correta": 0,
              "explicacao": "Persistência deve ser investigada em contexto."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Banco de configuração do Windows é ___.",
              "aceitos": [
                "Registro"
              ],
              "explicacao": "O conceito esperado é Registro."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_10",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "nanda",
          "titulo": "Serviços e tarefas",
          "atributo": "forense",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "nanda",
              "Hoje: serviços e tarefas. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Serviços e tarefas agendadas iniciam programas automaticamente. A criação de tarefas pode aparecer no evento Windows 4698 quando a auditoria correspondente está ativa.",
            "Busque mudanças inesperadas, contas privilegiadas, arquivos associados e histórico de criação para distinguir administração legítima de persistência."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual evento indica criação de tarefa agendada?",
              "opcoes": [
                "4698",
                "4624",
                "1102"
              ],
              "correta": 0,
              "explicacao": "4698 pode registrar criação de tarefa."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Automação de execução em horários é ___.",
              "aceitos": [
                "agendamento"
              ],
              "explicacao": "O conceito esperado é agendamento."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 5: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Na prova da loja, um comentário de ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c06",
      "titulo": "O Resgate",
      "mes": "Março",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "Na investigação, encontram Rui vivo, mantido preso em uma instalação remota do Nulo. As autoridades coordenam o resgate."
            ],
            [
              "a7_rui",
              "Lena? {nome}? Vocês estão aqui mesmo?"
            ],
            [
              "bia",
              "Primeiro atendimento e lugar seguro. Reunião de família depois, com menos risco."
            ],
            [
              "a7_lena",
              "Pela primeira vez vou concordar com a Bia sem pedir revisão."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_11",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "otavio",
          "titulo": "WMI e cron",
          "atributo": "forense",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "otavio",
              "Hoje: wmi e cron. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Inscrições permanentes de eventos WMI podem executar ações no Windows. Em sistemas Unix e Linux, cron agenda tarefas periódicas.",
            "Faça inventário e linha de base desses mecanismos, depois compare com alterações no período do incidente."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual mecanismo agenda tarefas no Linux?",
              "opcoes": [
                "cron",
                "GPO",
                "TLS"
              ],
              "correta": 0,
              "explicacao": "Cron é agendador de tarefas."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Tecnologia de gerenciamento Windows é ___.",
              "aceitos": [
                "WMI"
              ],
              "explicacao": "O conceito esperado é WMI."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_12",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "nanda",
          "titulo": "Threat hunting",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "nanda",
              "Hoje: threat hunting. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Threat hunting formula hipóteses de atividade adversária e procura evidências na telemetria. Não é esperar que o SIEM alerte sozinho.",
            "Registre a hipótese, fontes consultadas, período, achados e limitações. Ausência de evidência não é prova absoluta de ausência."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que é hunting?",
              "opcoes": [
                "Busca proativa por hipótese",
                "Desligamento de sensores",
                "Relatório sem investigação"
              ],
              "correta": 0,
              "explicacao": "Hunting é uma investigação orientada por hipóteses."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Caça proativa a ameaças é ___.",
              "aceitos": [
                "hunting"
              ],
              "explicacao": "O conceito esperado é hunting."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 6: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Começa a defesa em tempo real. Cada...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c07",
      "titulo": "Reconstruir a Confiança",
      "mes": "Abril",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "Onçarina protege acessos, Tucanal correlaciona inteligência, Capivárias faz monitoramento, Jararacas identifica tentativas de engano."
            ],
            [
              "enzo",
              "Eu fico na revisão de privilégios. Hoje meu orgulho é remover acesso indevido."
            ],
            [
              "heitor",
              "A krbtgt será rotacionada com planejamento. A confiança não volta por decreto."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_13",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "ruth",
          "titulo": "Contenção em escala",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "ruth",
              "Hoje: contenção em escala. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Conter um incidente em várias escolas pode envolver segmentação, isolamento de ativos afetados e bloqueio de acessos comprometidos.",
            "Avalie dependências e impacto antes de aplicar controles amplos; mantenha comunicação alternativa e coordenação entre equipes."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual ação deve preceder bloqueios amplos?",
              "opcoes": [
                "Avaliação de impacto e coordenação",
                "Desligar tudo sem plano",
                "Excluir toda evidência"
              ],
              "correta": 0,
              "explicacao": "Contenção deve proteger também continuidade operacional."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Separação lógica de redes é ___.",
              "aceitos": [
                "segmentação"
              ],
              "explicacao": "O conceito esperado é segmentação."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_14",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "heitor",
          "titulo": "Reconstrução do domínio",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "heitor",
              "Hoje: reconstrução do domínio. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "A recuperação deve partir de infraestrutura confiável, backups verificados, privilégios revisados e persistências erradicadas.",
            "A rotação da krbtgt em cenário de comprometimento requer duas trocas coordenadas em geral, com planejamento de replicação, validação e tempo de validade dos tíquetes."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Quando retomar serviços?",
              "opcoes": [
                "Após validação da confiança e erradicação",
                "Antes de investigar",
                "Sem checar backup"
              ],
              "correta": 0,
              "explicacao": "Retorno seguro exige validar a base recuperada."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Etapa de retorno à operação é ___.",
              "aceitos": [
                "recuperação"
              ],
              "explicacao": "O conceito esperado é recuperação."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 7: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "duelo",
          "lugar": "a7_centro_crise",
          "oponente": "nulo",
          "titulo": "Duelo de investigação",
          "antes": [
            [
              "narrador",
              "Três rodadas técnicas. A precisão vale mais que gritar feitiços."
            ]
          ],
          "rodadas": [
            {
              "tipo": "multipla",
              "pergunta": "Que atitude respeita o trabalho de cibersegurança?",
              "opcoes": [
                "Trabalhar nos sistemas autorizados",
                "Invadir infraestrutura alheia"
              ],
              "correta": 0,
              "explicacao": "A prática técnica exige autorização."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Um registro de evento útil para investigação é um ___.",
              "aceitos": [
                "log"
              ],
              "explicacao": "Logs ajudam a reconstituir ocorrências."
            },
            {
              "tipo": "multipla",
              "pergunta": "Como confirmar se uma correção funcionou?",
              "opcoes": [
                "Testar e observar evidências",
                "Confiar no slide bonito"
              ],
              "correta": 0,
              "explicacao": "Validação técnica é essencial."
            }
          ],
          "vitoria": [
            [
              "nanda",
              "Uma hipótese testada e uma ameaça a menos."
            ]
          ],
          "derrota": [
            [
              "heitor",
              "Errar no laboratório é aprender para a resposta real."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'O placar recebe pontos que nenhuma ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c08",
      "titulo": "Os Ecos do Domínio",
      "mes": "Maio",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "Com Rui a salvo, Lena encontra indícios de atividade semelhante em vários controladores. Tati propõe hipóteses verificáveis. O Nulo deixou rastros, mas também armadilhas para provocar acusações precipitadas."
            ],
            [
              "nanda",
              "Vamos trabalhar com evidências. Herói de palco não recupera sistema."
            ],
            [
              "enzo",
              "Entendi. Sem adivinhar e sem culpar ninguém antes da hora."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_17",
          "materia": "Resposta a Incidentes",
          "professor": "nanda",
          "titulo": "Caça entre controladores",
          "atributo": "forense",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "nanda",
              "Hoje: caça entre controladores. A solução exige evidências, não poderes de adivinhação."
            ],
            [
              "tati",
              "Vou registrar a hipótese e a resposta na planilha."
            ]
          ],
          "explicacao": [
            "Threat hunting consulta fontes de telemetria para testar hipóteses sobre atividade adversária. No Windows, 4624 registra logon bem-sucedido e 4625 registra tentativa de logon com falha, conforme auditoria habilitada.",
            "A análise deve combinar período, identidade, origem e comportamento. Um evento isolado não demonstra intenção. Documente sempre limites de retenção e cobertura dos sensores."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual evento representa logon bem-sucedido?",
              "opcoes": [
                "4624",
                "4625",
                "1102"
              ],
              "correta": 0,
              "explicacao": "4624 é um evento de logon com êxito."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito estudado: ___",
              "aceitos": [
                "4624"
              ],
              "explicacao": "Nesta aula, a palavra-chave é 4624."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe cada prática à finalidade.",
              "pares": [
                [
                  "Coleta",
                  "Reunir dados de fontes autorizadas"
                ],
                [
                  "Integridade",
                  "Detectar alterações indevidas"
                ],
                [
                  "Correlação",
                  "Relacionar eventos de várias fontes"
                ],
                [
                  "Reteste",
                  "Confirmar a eficácia da correção"
                ]
              ],
              "explicacao": "O ciclo de evidências inclui coleta, integridade, correlação e validação."
            },
            {
              "tipo": "multipla",
              "pergunta": "Qual princípio vale durante a investigação?",
              "opcoes": [
                "Preservar evidências e agir no escopo autorizado",
                "Apagar todos os logs",
                "Divulgar dados pessoais"
              ],
              "correta": 0,
              "explicacao": "Rastreabilidade e responsabilidade são essenciais."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_18",
          "materia": "Resposta a Incidentes",
          "professor": "a7_lena",
          "titulo": "Hipótese, não adivinhação",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "a7_lena",
              "Hoje: hipótese, não adivinhação. A solução exige evidências, não poderes de adivinhação."
            ],
            [
              "tati",
              "Vou registrar a hipótese e a resposta na planilha."
            ]
          ],
          "explicacao": [
            "Uma hipótese de hunting deve indicar exatamente que comportamento se espera encontrar, quais sistemas serão consultados e qual período será analisado.",
            "Se uma fonte não produz logs, isso limita a investigação. Relate a lacuna em vez de concluir que não houve comprometimento."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que concluir quando faltam logs de um controlador?",
              "opcoes": [
                "Há uma lacuna de visibilidade",
                "Não houve ataque",
                "O domínio já está seguro"
              ],
              "correta": 0,
              "explicacao": "Ausência de dados não equivale a ausência de ameaça."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito estudado: ___",
              "aceitos": [
                "hunting"
              ],
              "explicacao": "Nesta aula, a palavra-chave é hunting."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe cada prática à finalidade.",
              "pares": [
                [
                  "Coleta",
                  "Reunir dados de fontes autorizadas"
                ],
                [
                  "Integridade",
                  "Detectar alterações indevidas"
                ],
                [
                  "Correlação",
                  "Relacionar eventos de várias fontes"
                ],
                [
                  "Reteste",
                  "Confirmar a eficácia da correção"
                ]
              ],
              "explicacao": "O ciclo de evidências inclui coleta, integridade, correlação e validação."
            },
            {
              "tipo": "multipla",
              "pergunta": "Qual princípio vale durante a investigação?",
              "opcoes": [
                "Preservar evidências e agir no escopo autorizado",
                "Apagar todos os logs",
                "Divulgar dados pessoais"
              ],
              "correta": 0,
              "explicacao": "Rastreabilidade e responsabilidade são essenciais."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Decidir a próxima ação",
          "antes": [
            [
              "nanda",
              "Qual decisão preserva a segurança e o trabalho da equipe?"
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "O que deve orientar nossa resposta?",
            "opcoes": [
              "Evidência, autorização e validação",
              "Pressão do placar",
              "Um palpite popular"
            ],
            "correta": 0,
            "explicacao": "Procedimentos e fatos confirmados orientam a resposta."
          },
          "depois": [
            [
              "bia",
              "Resposta registrada. Assim ninguém confunde pressa com competência."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "escolha",
          "lugar": "a7_centro_crise",
          "pergunta": "A equipe precisa decidir como documentar esta etapa.",
          "opcoes": [
            {
              "texto": "Registrar as hipóteses e os resultados separadamente",
              "efeito": {
                "xp": 20,
                "amizade": {
                  "tati": 2
                }
              },
              "resposta": [
                [
                  "tati",
                  "Finalmente uma planilha que a equipe inteira quer preencher."
                ]
              ]
            },
            {
              "texto": "Organizar uma revisão coletiva das evidências",
              "efeito": {
                "xp": 20,
                "amizade": {
                  "enzo": 2
                }
              },
              "resposta": [
                [
                  "enzo",
                  "Eu vou ouvir antes de opinar. Sim, isso é novidade."
                ]
              ]
            }
          ]
        },
        {
          "tipo": "recompensa",
          "texto": "Capítulo 8 concluído. A equipe domina mais uma etapa da investigação.",
          "efeito": {
            "xp": 50,
            "atributos": {
              "defesa": 1,
              "forense": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c09",
      "titulo": "O Plano que Não Cabe no PowerPoint",
      "mes": "Junho",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "A Secretaria exige o retorno de todos os sistemas de uma vez. Iolanda responde com dependências de DNS, autenticação e aplicações. Lena desenha o plano de retomada no quadro enquanto Enzo revisa os privilégios."
            ],
            [
              "nanda",
              "Vamos trabalhar com evidências. Herói de palco não recupera sistema."
            ],
            [
              "enzo",
              "Entendi. Sem adivinhar e sem culpar ninguém antes da hora."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_19",
          "materia": "Resposta a Incidentes",
          "professor": "ruth",
          "titulo": "Recuperar por dependências",
          "atributo": "defesa",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "ruth",
              "Hoje: recuperar por dependências. A solução exige evidências, não poderes de adivinhação."
            ],
            [
              "tati",
              "Vou registrar a hipótese e a resposta na planilha."
            ]
          ],
          "explicacao": [
            "A recuperação de um incidente amplo deve priorizar infraestrutura confiável, serviços críticos e dependências. DNS e autenticação podem ser pré-requisitos de aplicações e operações.",
            "Restaure apenas backups íntegros e verificados, erradique persistências, teste cada onda de recuperação e mantenha planos de reversão."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Como organizar o retorno de serviços?",
              "opcoes": [
                "Por dependências e validação",
                "Por ordem alfabética",
                "Por reclamações no chat"
              ],
              "correta": 0,
              "explicacao": "Recuperação coordenada reduz reinfecção e indisponibilidade."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito estudado: ___",
              "aceitos": [
                "recuperação"
              ],
              "explicacao": "Nesta aula, a palavra-chave é recuperação."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe cada prática à finalidade.",
              "pares": [
                [
                  "Coleta",
                  "Reunir dados de fontes autorizadas"
                ],
                [
                  "Integridade",
                  "Detectar alterações indevidas"
                ],
                [
                  "Correlação",
                  "Relacionar eventos de várias fontes"
                ],
                [
                  "Reteste",
                  "Confirmar a eficácia da correção"
                ]
              ],
              "explicacao": "O ciclo de evidências inclui coleta, integridade, correlação e validação."
            },
            {
              "tipo": "multipla",
              "pergunta": "Qual princípio vale durante a investigação?",
              "opcoes": [
                "Preservar evidências e agir no escopo autorizado",
                "Apagar todos os logs",
                "Divulgar dados pessoais"
              ],
              "correta": 0,
              "explicacao": "Rastreabilidade e responsabilidade são essenciais."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_20",
          "materia": "Resposta a Incidentes",
          "professor": "heitor",
          "titulo": "A rotação da krbtgt",
          "atributo": "cripto",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "heitor",
              "Hoje: a rotação da krbtgt. A solução exige evidências, não poderes de adivinhação."
            ],
            [
              "tati",
              "Vou registrar a hipótese e a resposta na planilha."
            ]
          ],
          "explicacao": [
            "A conta krbtgt protege tíquetes Kerberos TGT. Após comprometimento, geralmente são necessárias duas rotações coordenadas para invalidar a confiança em segredos antigos.",
            "Não execute duas mudanças imediatamente: considere replicação, validade dos tíquetes e controladores somente leitura. Siga o plano de recuperação e orientações técnicas aplicáveis."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Por que coordenar as duas rotações de krbtgt?",
              "opcoes": [
                "Para respeitar replicação e validade dos tíquetes",
                "Porque o firewall exige",
                "Porque DNS impede alteração"
              ],
              "correta": 0,
              "explicacao": "O intervalo e a sequência devem proteger a disponibilidade."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito estudado: ___",
              "aceitos": [
                "krbtgt"
              ],
              "explicacao": "Nesta aula, a palavra-chave é krbtgt."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe cada prática à finalidade.",
              "pares": [
                [
                  "Coleta",
                  "Reunir dados de fontes autorizadas"
                ],
                [
                  "Integridade",
                  "Detectar alterações indevidas"
                ],
                [
                  "Correlação",
                  "Relacionar eventos de várias fontes"
                ],
                [
                  "Reteste",
                  "Confirmar a eficácia da correção"
                ]
              ],
              "explicacao": "O ciclo de evidências inclui coleta, integridade, correlação e validação."
            },
            {
              "tipo": "multipla",
              "pergunta": "Qual princípio vale durante a investigação?",
              "opcoes": [
                "Preservar evidências e agir no escopo autorizado",
                "Apagar todos os logs",
                "Divulgar dados pessoais"
              ],
              "correta": 0,
              "explicacao": "Rastreabilidade e responsabilidade são essenciais."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Decidir a próxima ação",
          "antes": [
            [
              "nanda",
              "Qual decisão preserva a segurança e o trabalho da equipe?"
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "O que deve orientar nossa resposta?",
            "opcoes": [
              "Evidência, autorização e validação",
              "Pressão do placar",
              "Um palpite popular"
            ],
            "correta": 0,
            "explicacao": "Procedimentos e fatos confirmados orientam a resposta."
          },
          "depois": [
            [
              "bia",
              "Resposta registrada. Assim ninguém confunde pressa com competência."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "escolha",
          "lugar": "a7_centro_crise",
          "pergunta": "A equipe precisa decidir como documentar esta etapa.",
          "opcoes": [
            {
              "texto": "Registrar as hipóteses e os resultados separadamente",
              "efeito": {
                "xp": 20,
                "amizade": {
                  "tati": 2
                }
              },
              "resposta": [
                [
                  "tati",
                  "Finalmente uma planilha que a equipe inteira quer preencher."
                ]
              ]
            },
            {
              "texto": "Organizar uma revisão coletiva das evidências",
              "efeito": {
                "xp": 20,
                "amizade": {
                  "enzo": 2
                }
              },
              "resposta": [
                [
                  "enzo",
                  "Eu vou ouvir antes de opinar. Sim, isso é novidade."
                ]
              ]
            }
          ]
        },
        {
          "tipo": "recompensa",
          "texto": "Capítulo 9 concluído. A equipe domina mais uma etapa da investigação.",
          "efeito": {
            "xp": 50,
            "atributos": {
              "defesa": 1,
              "forense": 1
            }
          }
        }
      ]
    },
    {
      "id": "a7c10",
      "titulo": "Formatura na Neblina",
      "mes": "Julho",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "narrador",
              "A resposta reúne logs, hashes, cadeia de custódia e identidades. O Nulo é identificado como Gabriel Nunes pelas evidências e detido pelas autoridades."
            ],
            [
              "a7_lena",
              "A sétima camada não é um programa. É um bilhete para você."
            ],
            [
              "jonas",
              "Sete anos de coragem, de estudo e de união. Quem protege gente de verdade merece a celebração."
            ],
            [
              "vo_cida",
              "Eu imprimi o cordel, os convites e a lista de convidados. Tudo em três vias."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_15",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "zuleica",
          "titulo": "Comunicação de crise",
          "atributo": "social",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "zuleica",
              "Hoje: comunicação de crise. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "Uma atualização de incidente deve separar fatos confirmados, hipóteses, impacto, ações executadas e próximos passos.",
            "Defina porta-vozes, proteja dados pessoais, comunique responsáveis e documente decisões. Não prometa prazos sem base."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que caracteriza comunicação adequada?",
              "opcoes": [
                "Fatos, incertezas e ações",
                "Acusações sem prova",
                "Vazamento de vítimas"
              ],
              "correta": 0,
              "explicacao": "Comunicação de crise precisa ser responsável."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Mensagem oficial de situação é ___.",
              "aceitos": [
                "comunicado"
              ],
              "explicacao": "O conceito esperado é comunicado."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a7_aula_16",
          "materia": "Defesa e Resposta a Incidentes",
          "professor": "iolanda",
          "titulo": "LGPD e perícia",
          "atributo": "social",
          "lugar": "a7_centro_crise",
          "abertura": [
            [
              "iolanda",
              "Hoje: lgpd e perícia. Nenhuma mágica substitui evidência."
            ],
            [
              "tati",
              "Eu anoto os fatos confirmados longe das hipóteses."
            ]
          ],
          "explicacao": [
            "A LGPD disciplina tratamento de dados pessoais. Incidentes podem exigir comunicação à ANPD e a titulares conforme critérios e prazos regulatórios aplicáveis.",
            "Envolva jurídico e encarregado, avalie risco, preserve evidências e registre cadeia de custódia. Atribuição de autoria exige prova, não suposição."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Como lidar com dados pessoais num incidente?",
              "opcoes": [
                "Avaliar obrigações e preservar evidências",
                "Publicar dados",
                "Destruir logs"
              ],
              "correta": 0,
              "explicacao": "Governança e técnica precisam trabalhar juntas."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Lei brasileira de dados pessoais é ___.",
              "aceitos": [
                "LGPD"
              ],
              "explicacao": "O conceito esperado é LGPD."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a7_centro_crise",
          "titulo": "Missão 8: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "cena",
          "lugar": "cripta",
          "falas": [
            [
              "heitor",
              "A Camada 4 abriu. É um código-fonte incompleto, com o nome PROJETO CHAVE MESTRA."
            ],
            [
              "tati",
              "O arquivo cita credenciais e controladores de rede. Era isso que o infiltrado procurava."
            ],
            [
              "iolanda",
              "Ganhar ou empatar no torneio tem menos valor que preservar as pessoas. Parabéns pela escolha."
            ],
            [
              "voce",
              "O Nulo disse que sou igual à minha mãe. Talvez seja o melhor elogio possível."
            ]
          ]
        },
        {
          "tipo": "cena",
          "lugar": "a7_centro_crise",
          "falas": [
            [
              "iolanda",
              "A confiança foi reconstruída, as persistências removidas, os sistemas validados e a perícia encaminhada."
            ],
            [
              "a7_rui",
              "Estamos juntos de novo. É o que importa."
            ],
            [
              "a7_lena",
              "Agora a chave é sua."
            ],
            [
              "voce",
              "Vou usá-la para proteger, nunca para controlar."
            ],
            [
              "jonas",
              "E assim se forma a turma que transformou o apagão em luz."
            ],
            [
              "vo_cida",
              "A minha impressora já está fazendo os diplomas."
            ]
          ]
        },
        {
          "tipo": "recompensa",
          "texto": "Sétima camada aberta. Lena e Rui estão de volta, o Nulo foi detido pelas provas e a turma se forma.",
          "efeito": {
            "xp": 150,
            "item": "a7_bilhete",
            "flag": "a7_camada7"
          }
        },
        {
          "tipo": "fimDeAno"
        }
      ]
    }
  ],
  "feiticos": [],
  "criaturas": [],
  "figurinhas": [],
  "itens": [
    {
      "id": "a7_bilhete",
      "nome": "Bilhete final de Lena",
      "descricao": "Agora a chave é sua."
    }
  ],
  "lugares": [
    {
      "id": "a7_centro_crise",
      "nome": "Centro de Crise da Torre",
      "descricao": "A torre vira centro de resposta ao segundo Grande Apagão.",
      "ano": 7,
      "cena": "torre"
    },
    {
      "id": "a7_oficina",
      "nome": "Oficina do Bem-te-vi",
      "descricao": "O refúgio onde Lena investigou o Nulo por anos.",
      "ano": 7,
      "cena": "casa"
    }
  ],
  "personagens": [
    {
      "id": "a7_lena",
      "nome": "Lena",
      "papel": "Mãe, especialista em resposta a incidentes",
      "cor": "#dca9d5",
      "pele": "#b87953",
      "cabelo": "#302019",
      "estilo": "cacheado",
      "roupa": "#503b73"
    },
    {
      "id": "a7_rui",
      "nome": "Rui",
      "papel": "Pai, investigador resgatado",
      "cor": "#8bb5cb",
      "pele": "#99623c",
      "cabelo": "#211912",
      "estilo": "barba",
      "roupa": "#29485c"
    }
  ]
};
